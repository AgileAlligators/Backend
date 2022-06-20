import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import { HotspotFilterDto } from 'src/_common/dto/hotspot-filter.dto';
import { timestampFilter } from 'src/_common/functions/timestampFilter.function';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierIdleFilterDto } from '../location/dtos/carrier-idle-filter.dto';
import { Idle } from '../location/schemas/Idle.schema';
import { Location } from './schemas/Location.schema';

@Injectable()
export class IdleService {
  constructor(
    @InjectModel(Idle.name)
    private readonly idleModel: Model<Idle>,
    @InjectModel(Location.name)
    private readonly locationModel: Model<Location>,
    private readonly carrierService: CarrierService,
  ) {}

  public async sync(carrierId: string, timestamp?: number): Promise<void> {
    const idles = await this.getIdles(carrierId, timestamp);
    await Promise.all(
      idles.map((idle) => {
        this.idleModel.updateOne(
          { carrierId: idle.carrierId, timestamp: idle.timestamp },
          { $set: idle },
          { upsert: true },
        );
      }),
    );
  }

  public async search(
    organisation: string,
    dto: CarrierIdleFilterDto,
  ): Promise<SearchResult<Idle>> {
    const { skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Idle> = {
      carrierId: { $in: ids },
      ...timestampFilter(dto),
    };

    return {
      total: await this.idleModel.countDocuments(fq),
      results: await this.idleModel.find(fq, undefined, qo),
    };
  }

  public async getHotspot(
    organisation: string,
    filter?: HotspotFilterDto,
  ): Promise<any[]> {
    const { fq, ids } = await this.getOptions(organisation, filter, 10);
    return (<any>this.idleModel).aggregate([
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
                [{ $round: ['$idle', 4] }],
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
      const data = await (<any>this.idleModel).aggregate(this.getPipeline(fq));
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    const data = await Promise.all(
      ids.map((id) =>
        (<any>this.idleModel).aggregate(
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

  private getPipeline(match: FilterQuery<Idle>): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$timestamp',
          buckets: 100,
          output: { y: { $avg: '$idle' } },
        },
      },
      {
        $set: {
          x: { $round: [{ $avg: ['$_id.min', '$_id.max'] }] },
          y: { $round: [{ $divide: ['$y', 60000] }, 0] },
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
  ): Promise<{ ids: string[]; fq: FilterQuery<Idle> }> {
    const ids = await this.carrierService.getIds(organisation, filter, maxIds);

    const fq: FilterQuery<Idle> = {
      carrierId: { $in: ids },
      ...timestampFilter(filter),
    };

    return { ids, fq };
  }

  private async getIdles(
    carrierId: string,
    timestamp?: number,
  ): Promise<Idle[]> {
    const fq: FilterQuery<Location> = { carrierId: carrierId };
    if (timestamp) {
      const offset = 86400000; // 1 Day
      fq.timestamp = { $gte: timestamp - offset, $lte: timestamp + offset };
    }

    return (<any>this.locationModel).aggregate([
      { $match: fq },
      { $sort: { timestamp: 1 } },
      { $group: { _id: 0, document: { $push: '$$ROOT' } } },
      {
        $project: {
          prevDoc: {
            $zip: {
              inputs: [
                '$document',
                { $concatArrays: [[null], '$document.timestamp'] },
                { $concatArrays: [[null], '$document.location'] },
              ],
            },
          },
        },
      },
      { $unwind: { path: '$prevDoc' } },
      {
        $replaceWith: {
          $mergeObjects: [
            { $arrayElemAt: ['$prevDoc', 0] },
            { prevTime: { $arrayElemAt: ['$prevDoc', 1] } },
            { prevLoc: { $arrayElemAt: ['$prevDoc', 2] } },
          ],
        },
      },
      {
        $set: {
          _disP1: {
            $degreesToRadians: { $arrayElemAt: ['$location.coordinates', 1] },
          },
          _disP2: {
            $degreesToRadians: { $arrayElemAt: ['$prevLoc.coordinates', 1] },
          },
          _disA: {
            $subtract: [
              {
                $degreesToRadians: {
                  $arrayElemAt: ['$location.coordinates', 0],
                },
              },
              {
                $degreesToRadians: {
                  $arrayElemAt: ['$prevLoc.coordinates', 0],
                },
              },
            ],
          },
        },
      },
      {
        $set: {
          r: {
            $add: [
              {
                $multiply: [
                  { $cos: '$_disP1' },
                  { $cos: '$_disP2' },
                  { $cos: '$_disA' },
                ],
              },
              { $multiply: [{ $sin: '$_disP1' }, { $sin: '$_disP2' }] },
            ],
          },
        },
      },
      {
        $set: {
          idle: {
            $cond: {
              if: {
                $gt: [
                  {
                    $cond: {
                      if: { $gt: ['$r', 1] },
                      then: { $multiply: [{ $acos: 1 }, 6371392.896] },
                      else: { $multiply: [{ $acos: '$r' }, 6371392.896] },
                    },
                  },
                  5,
                ],
              },
              then: 0,
              else: {
                $trunc: [
                  {
                    $divide: [
                      { $subtract: ['$timestamp', '$prevTime'] },
                      60000,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: [
          '_disP1',
          '_disP2',
          '_disA',
          'r',
          'prevTime',
          'prevLoc',
          '_id',
          '__v',
        ],
      },
      { $match: { idle: { $ne: null } } },
    ]);
  }
}
