import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
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

  public async syncIdle(carrierId: string): Promise<void> {
    await this.idleModel.deleteMany({ carrierId: carrierId });
    this.idleModel.insertMany(await this.getIdles(carrierId));
  }

  public async search(
    organisation: string,
    dto: CarrierIdleFilterDto,
  ): Promise<SearchResult<Idle>> {
    const { end, start, skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Idle> = { carrierId: { $in: ids } };

    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return {
      total: await this.idleModel.countDocuments(fq),
      results: await this.idleModel.find(fq, undefined, qo),
    };
  }

  public async getDiagram(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.idleModel.aggregate(this.getPipeline(fq));
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.idleModel.aggregate(this.getPipeline(fq));
        return { name: id, data };
      }),
    );
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
  ): Promise<{ ids: string[]; fq: FilterQuery<Idle> }> {
    const ids = await this.carrierService.getIds(organisation, filter);

    const { start, end } = filter || {};
    const fq: FilterQuery<Idle> = { carrierId: { $in: ids } };
    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return { ids, fq };
  }

  private async getIdles(carrierId: string): Promise<Idle[]> {
    return this.locationModel.aggregate([
      { $match: { carrierId: carrierId } },
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
