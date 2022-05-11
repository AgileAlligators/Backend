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

@Injectable()
export class DiagramService {
  constructor(
    @InjectModel(Load.name) private readonly loadModel: Model<Load>,
  ) {}

  async getLineDiagram(filter: DiagramFilterDto): Promise<LineDiagramDto> {
    if (!isMongoId(filter.id)) throw InvalidCarrier(filter.id);

    if (!(filter.dataRequest in DATA_REQUEST_TYPES))
      throw InvalidDiagrammRequest(filter.dataRequest);

    return await this.getLoadOverTime(filter);
  }

  async getLoadOverTime(filter: DiagramFilterDto): Promise<LineDiagramDto> {
    const load: Load[] = await this.loadModel.find({
      where: {
        carrierId: filter.id,
        timestamp: {
          $gt: filter.start,
          $lt: filter.end,
        },
      },
    });

    const dataPairs: [any, any][] = load.map((l) => [l.timestamp, l.load]);

    return {
      dataPairs: dataPairs,
    };
  }
}

const DATA_REQUEST_TYPES = ['loadOverTime'];
