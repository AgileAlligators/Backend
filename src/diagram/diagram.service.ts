import { Injectable } from '@nestjs/common';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { LineDiagramDto } from './dto/line-diagram.dto';

const DATA_REQUEST_TYPES = ['loadOverTime', 'idleOverTime'];

@Injectable()
export class DiagramService {
  constructor(private readonly carrierService: CarrierService) {}

  async getLineDiagram(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<LineDiagramDto[]> {
    // switch (filter.dataRequest) {
    //   case 'loadOverTime':
    //     return await this.getLoadOverTime(filter);
    //   case 'idleOverTime':
    //     return await this.getIdleOverTime(filter);
    // }
    return this.getLoadOverTime(organisation, filter);
  }

  async getLoadOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<LineDiagramDto[]> {
    const { results } = await this.carrierService.searchLoad(
      organisation,
      filter,
    );

    return results
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
  }

  async getIdleOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<LineDiagramDto[]> {
    const { results } = await this.carrierService.searchIdle(
      organisation,
      filter,
    );
    return results
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
  }
}
