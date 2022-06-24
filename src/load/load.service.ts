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
  InvalidLoad,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { timestampFilter } from 'src/_common/functions/timestampFilter.function';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { Load } from './schemas/Load.schema';

@Injectable()
export class LoadService {
  constructor(
    @InjectModel(Load.name)
    private readonly loadModel: Model<Load>,
    @Inject(forwardRef(() => LocationService))
    private readonly locationService: LocationService,
    private readonly carrierService: CarrierService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreLoadDto,
  ): Promise<Load> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const location = await this.locationService.getClosestTo(
      carrierId,
      dto.timestamp || Date.now(),
    );
    if (location) dto.location = location;

    return this.loadModel.create({ carrierId, ...dto });
  }

  public async sync(carrierId: string, timestamp: number): Promise<any> {
    const loads: { id: string; timestamp: number; carrierId: string }[] =
      await this.loadModel.aggregate([
        { $match: { carrierId: carrierId, timestamp: { $gte: 0 } } },
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
      loads.map(async (l) => {
        const location = await this.locationService.getClosestTo(
          l.carrierId,
          l.timestamp,
        );
        if (location) {
          return this.loadModel.updateOne({ _id: l.id }, { $set: location });
        }
      }),
    );
  }

  public async search(
    organisation: string,
    dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    const { skip, limit, timestamp } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Load> = {
      carrierId: { $in: ids },
      ...timestampFilter(dto),
    };

    if (timestamp !== undefined) {
      fq.timestamp = { $lte: timestamp };
      qo.limit = 1;
      qo.sort = { timestamp: -1 };
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

  public async getHotspot(
    organisation: string,
    filter?: HotspotFilterDto,
  ): Promise<HotspotDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter, 25);
    return (<any>this.loadModel).aggregate([
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
                [{ $round: ['$load', 4] }],
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
      const data = await (<any>this.loadModel).aggregate(this.getPipeline(fq));
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    const data = await Promise.all(
      ids.map((id) =>
        (<any>this.loadModel).aggregate(
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

  private getPipeline(match: FilterQuery<Load>): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$timestamp',
          buckets: 150,
          output: { y: { $avg: '$load' } },
        },
      },
      {
        $set: {
          x: { $round: [{ $avg: ['$_id.min', '$_id.max'] }] },
          y: { $round: [{ $multiply: ['$y', 100] }, 2] },
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
  ): Promise<{ ids: string[]; fq: FilterQuery<Load> }> {
    const ids = await this.carrierService.getIds(organisation, filter, maxIds);

    const fq: FilterQuery<Load> = {
      carrierId: { $in: ids },
      ...timestampFilter(filter),
    };

    return { ids, fq };
  }
}
