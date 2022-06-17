import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { CarrierService } from 'src/carrier/carrier.service';
import { Idle } from 'src/carrier/schemas/Idle.schema';
import { Load } from 'src/carrier/schemas/Load.schema';
import { Vibration } from 'src/carrier/schemas/Vibration.schema';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { DiagramDto } from './dto/diagram.dto';

@Injectable()
export class DiagramService {
  constructor(
    @InjectModel(Load.name)
    private readonly loadModel: Model<Load>,
    @InjectModel(Idle.name)
    private readonly idleModel: Model<Idle>,
    @InjectModel(Vibration.name)
    private readonly vibrationModel: Model<Vibration>,

    private readonly carrierService: CarrierService,
  ) {}

  private getPipeline<T>(
    match: FilterQuery<T>,
    xAxis: string,
    yAxis: string,
    multiplier: number,
  ): PipelineStage[] {
    return [
      { $match: match },
      {
        $bucketAuto: {
          groupBy: '$' + xAxis,
          buckets: 100,
          output: { y: { $avg: { $multiply: ['$' + yAxis, multiplier] } } },
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

  private async getOptions<T extends { timestamp: number }>(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<{ ids: string[]; fq: FilterQuery<T> }> {
    const ids = (
      await this.carrierService.getUnique(organisation, '_id', filter)
    ).map((id) => id.toString());

    const { start, end } = filter || {};
    const fq: FilterQuery<T> = { carrierId: { $in: ids } };
    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    return { ids, fq };
  }

  public async getLoadOverTime(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.loadModel.aggregate(
        this.getPipeline(fq, 'timestamp', 'load', 100),
      );
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.loadModel.aggregate(
          this.getPipeline(fq, 'timestamp', 'load', 100),
        );
        return { name: id, data };
      }),
    );
  }

  public async getIdleOverTime(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.idleModel.aggregate(
        this.getPipeline(fq, 'timestamp', 'idle', 1 / 1000),
      );
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.idleModel.aggregate(
          this.getPipeline(fq, 'timestamp', 'idle', 1 / 1000),
        );
        return { name: id, data };
      }),
    );
  }

  public async getVibrationOverTime(
    organisation: string,
    filter?: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { fq, ids } = await this.getOptions(organisation, filter);

    // Avg of all
    if (ids.length > 10) {
      const data = await this.vibrationModel.aggregate(
        this.getPipeline(fq, 'timestamp', 'vibration', 1),
      );
      return [{ name: 'Durchschnitt', data }];
    }

    // Avg of individuell
    return Promise.all(
      ids.map(async (id) => {
        fq.carrierId = id;
        const data = await this.vibrationModel.aggregate(
          this.getPipeline(fq, 'timestamp', 'vibration', 1),
        );
        return { name: id, data };
      }),
    );
  }
}
