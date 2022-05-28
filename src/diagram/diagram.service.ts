import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Model } from 'mongoose';
import { Idle } from 'src/carrier/schemas/Idle.schema';
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
    @InjectModel(Idle.name) private readonly idleModel: Model<Idle>,
  ) {}

  async getLineDiagram(filter: DiagramFilterDto): Promise<LineDiagramDto[]> {
    for (const id of filter.ids) {
      if (!isMongoId(id)) throw InvalidCarrier(id);
    }

    if (!DATA_REQUEST_TYPES.includes(filter.dataRequest))
      throw InvalidDiagrammRequest(filter.dataRequest);

    switch (filter.dataRequest) {
      case 'loadOverTime':
        return await this.getLoadOverTime(filter);
      case 'idleOverTime':
        return await this.getIdleOverTime(filter);
    }
  }

  async getLoadOverTime(filter: DiagramFilterDto): Promise<LineDiagramDto[]> {
    let load: Load[] = await this.loadModel.find();

    load = load.filter((l) => filter.ids.includes(l.carrierId));

    load = load.filter(
      (l) => (!filter.start || l.timestamp >= filter.start) && (!filter.end || l.timestamp <= filter.end)
    );

    const diagrams: LineDiagramDto[] = load
      .map((l) => {
        return { carrierId: l.carrierId, dataPairs: [[l.timestamp, l.load]] };
      })
      .reduce((diagrams: LineDiagramDto[], load: LineDiagramDto) => {
        const diagram = diagrams.find((d) => d.carrierId == load.carrierId);
        if (!diagram) {
          diagrams.push(load);
        } else {
          diagram.dataPairs.push(load.dataPairs[0]);
        }
        return diagrams;
      }, []);

    return diagrams;
  }

  async getIdleOverTime(filter: DiagramFilterDto): Promise<LineDiagramDto[]> {
    let idle: Idle[] = await this.idleModel.find();

    idle = idle.filter((i) => filter.ids.includes(i.carrierId));

    idle = idle.filter(
      (i) => (!filter.start || i.timestamp >= filter.start) && (!filter.end || i.timestamp <= filter.end)
    );

    const diagrams: LineDiagramDto[] = idle
      .map((i) => {
        return { carrierId: i.carrierId, dataPairs: [[i.timestamp, i.idle]] };
      })
      .reduce((diagrams: LineDiagramDto[], idle: LineDiagramDto) => {
        const diagram = diagrams.find((d) => d.carrierId == idle.carrierId);
        if (!diagram) {
          diagrams.push(idle);
        } else {
          diagram.dataPairs.push(idle.dataPairs[0]);
        }
        return diagrams;
      }, []);

    return diagrams;
  }
}
