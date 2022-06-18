import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import {
  InvalidCarrier,
  InvalidVibration,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierVibrationFilterDto } from './dtos/carrier-vibration-filter.dto';
import { StoreVibrationDto } from './dtos/store-vibration.dto';
import { Vibration } from './schemas/Vibration.schema';

@Injectable()
export class VibrationService {
  constructor(
    @InjectModel(Vibration.name)
    private readonly vibrationModel: Model<Vibration>,
    private readonly carrierService: CarrierService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreVibrationDto,
  ): Promise<Vibration> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    return this.vibrationModel.create({ carrierId, ...dto });
  }

  public async search(
    organisation: string,
    dto: CarrierVibrationFilterDto,
  ): Promise<SearchResult<Vibration>> {
    const { end, start, skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Vibration> = { carrierId: { $in: ids } };

    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return {
      total: await this.vibrationModel.countDocuments(fq),
      results: await this.vibrationModel.find(fq, undefined, qo),
    };
  }

  public async delete(
    organisation: string,
    carrierId: string,
    vibrationId: string,
  ): Promise<boolean> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const res = await this.vibrationModel.deleteOne({
      _id: vibrationId,
      carrierId,
    });

    if (res.deletedCount === 0) throw InvalidVibration(vibrationId);
    return true;
  }

  public async getDiagram(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.vibrationModel.aggregate(this.getPipeline(fq));
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.vibrationModel.aggregate(this.getPipeline(fq));
        return { name: id, data };
      }),
    );
  }

  private getPipeline(match: FilterQuery<Vibration>): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$timestamp',
          buckets: 100,
          output: { y: { $avg: '$vibration' } },
        },
      },
      {
        $set: {
          x: { $round: [{ $avg: ['$_id.min', '$_id.max'] }] },
          y: { $round: ['$y', 2] },
        },
      },
      { $unset: '_id' },
      { $sort: { x: 1 } },
    ];
  }

  private async getOptions(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<{ ids: string[]; fq: FilterQuery<Vibration> }> {
    const ids = await this.carrierService.getIds(organisation, filter);

    const { start, end } = filter || {};
    const fq: FilterQuery<Vibration> = { carrierId: { $in: ids } };
    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return { ids, fq };
  }
}
