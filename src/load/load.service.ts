import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import {
  InvalidCarrier,
  InvalidLoad,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { Load } from './schemas/Load.schema';

@Injectable()
export class LoadService {
  constructor(
    @InjectModel(Load.name)
    private readonly loadModel: Model<Load>,
    private readonly carrierService: CarrierService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreLoadDto,
  ): Promise<Load> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    return this.loadModel.create({ carrierId, ...dto });
  }

  public async search(
    organisation: string,
    dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    const { end, start, skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Load> = { carrierId: { $in: ids } };
    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return {
      total: await this.loadModel.countDocuments(fq),
      results: await this.loadModel.find(fq, undefined, qo),
    };
  }

  public async delete(
    organisation: string,
    carrierId: string,
    loadId: string,
  ): Promise<boolean> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const res = await this.loadModel.deleteOne({ _id: loadId, carrierId });

    if (res.deletedCount === 0) throw InvalidLoad(loadId);
    return true;
  }

  public async getDiagram(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.loadModel.aggregate(this.getPipeline(fq));
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.loadModel.aggregate(this.getPipeline(fq));
        return { name: id, data };
      }),
    );
  }

  private getPipeline(match: FilterQuery<Load>): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$timestamp',
          buckets: 100,
          output: { y: { $avg: { $multiply: ['$load', 100] } } },
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
  ): Promise<{ ids: string[]; fq: FilterQuery<Load> }> {
    const ids = await this.carrierService.getIds(organisation, filter);

    const { start, end } = filter || {};
    const fq: FilterQuery<Load> = { carrierId: { $in: ids } };
    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return { ids, fq };
  }
}
