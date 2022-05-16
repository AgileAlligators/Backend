import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Model } from 'mongoose';
import { Load } from 'src/carrier/schemas/Load.schema';
import {
  InvalidCarrier,
  InvalidDiagrammRequest,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { DiagramFilterDto } from './dto/diagramm-filter.dto';
import { LineDiagramDto } from './dto/line-diagram.dto';

const DATA_REQUEST_TYPES = ['loadOverTime'];

@Injectable()
export class DiagramService {
  constructor(
    @InjectModel(Load.name) private readonly loadModel: Model<Load>,
  ) {}

  async getLineDiagram(filter: DiagramFilterDto): Promise<LineDiagramDto> {
    if (!isMongoId(filter.id)) throw InvalidCarrier(filter.id);

    if (!DATA_REQUEST_TYPES.includes(filter.dataRequest))
      throw InvalidDiagrammRequest(filter.dataRequest);

    switch (filter.dataRequest) {
      case 'loadOverTime':
        return await this.getLoadOverTime(filter);
    }
  }

  async getLoadOverTime(filter: DiagramFilterDto): Promise<LineDiagramDto> {
    let load: Load[] = await this.loadModel.find({
      where: {
        carrierId: filter.id,
        timestamp: {
          $gt: filter.start,
          $lt: filter.end,
        },
      },
    });

    // $gt and $lt don't seem to work
    load = load.filter(
      (l) => l.timestamp >= filter.start && l.timestamp <= filter.end,
    );

    const dataPairs: [any, any][] = load.map((l) => [l.timestamp, l.load]);

    return {
      dataPairs: dataPairs,
    };
  }
}
