import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { LocationService } from 'src/location/location.service';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import { HotspotFilterDto } from 'src/_common/dto/hotspot-filter.dto';
import { HotspotDto } from 'src/_common/dto/hotspot.dto';
import {
  InvalidCarrier,
  InvalidVibration,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { timestampFilter } from 'src/_common/functions/timestampFilter.function';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierVibrationFilterDto } from './dtos/carrier-vibration-filter.dto';
import { StoreVibrationDto } from './dtos/store-vibration.dto';
import { Vibration } from './schemas/Vibration.schema';

@Injectable()
export class VibrationService {
  constructor(
    @InjectModel(Vibration.name)
    private readonly vibrationModel: Model<Vibration>,
    @Inject(forwardRef(() => LocationService))
    private readonly locationService: LocationService,
    private readonly carrierService: CarrierService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreVibrationDto,
  ): Promise<Vibration> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const location = await this.locationService.getClosestTo(
      carrierId,
      dto.timestamp || Date.now(),
    );
    if (location) dto.location = location;

    return this.vibrationModel.create({ carrierId, ...dto });
  }

  public async sync(carrierId: string, timestamp: number): Promise<void> {
    const vibrations: { id: string; timestamp: number; carrierId: string }[] =
      await (<any>this.vibrationModel).aggregate([
        { $match: { carrierId: carrierId, timestamp: { $exists: true } } },
        {
          $project: {
            diff: { $abs: { $subtract: [timestamp, '$timestamp'] } },
            id: { $toString: '$_id' },
            timestamp: '$timestamp',
            carrierId: '$carrierId',
          },
        },
        { $sort: { diff: 1 } },
        { $limit: 10 },
        { $unset: ['_id', 'diff'] },
      ]);

    await Promise.all(
      vibrations.map(async (v) => {
        const location = await this.locationService.getClosestTo(
          v.carrierId,
          v.timestamp,
        );
        if (location) {
          return this.vibrationModel.updateOne(
            { _id: v.id },
            { $set: location },
          );
        }
      }),
    );
  }

  public async search(
    organisation: string,
    dto: CarrierVibrationFilterDto,
  ): Promise<SearchResult<Vibration>> {
    const { skip, limit, minVibration } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Vibration> = {
      carrierId: { $in: ids },
      ...timestampFilter(dto),
    };

    if (minVibration !== undefined) fq.vibration = { $gte: minVibration };

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

  public async getHotspot(
    organisation: string,
    filter?: HotspotFilterDto,
  ): Promise<HotspotDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter, 25);
    return (<any>this.vibrationModel).aggregate([
      {
        $match: { ...fq, carrierId: { $in: ids }, location: { $exists: true } },
      },
      {
        $group: {
          _id: '$carrierId',
          dataTuples: {
            $push: {
              $concatArrays: [
                ['$timestamp'],
                ['$location.coordinates'],
                [{ $round: ['$vibration', 4] }],
              ],
            },
          },
        },
      },
    ]);
  }

  public async getDiagram(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await (<any>this.vibrationModel).aggregate(
        this.getPipeline(fq),
      );
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    const data = await Promise.all(
      ids.map((id) =>
        (<any>this.vibrationModel).aggregate(
          this.getPipeline({ ...fq, carrierId: id }),
        ),
      ),
    );

    return ids
      .map((id, index) => {
        return { name: id, data: data[index] };
      })
      .filter(({ data }) => data.length > 0);
  }

  private getPipeline(match: FilterQuery<Vibration>): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$timestamp',
          buckets: 150,
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
    filter: DiagramFilterDto | HotspotFilterDto = {},
    maxIds = 11,
  ): Promise<{ ids: string[]; fq: FilterQuery<Vibration> }> {
    const ids = await this.carrierService.getIds(organisation, filter, maxIds);

    const fq: FilterQuery<Vibration> = {
      carrierId: { $in: ids },
      ...timestampFilter(filter),
    };

    return { ids, fq };
  }
}
