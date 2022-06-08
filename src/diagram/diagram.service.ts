import { Injectable } from '@nestjs/common';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { DiagramDto } from './dto/diagram.dto';

@Injectable()
export class DiagramService {
  constructor(private readonly carrierService: CarrierService) {}

  async getLoadOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { results } = await this.carrierService.searchLoad(
      organisation,
      filter,
    );

    return this.reduceData(results
      .map((l) => {
        return { name: l.carrierId, data: [{ x: l.timestamp, y: l.load}] };
      }));
  }

  async getIdleOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { results } = await this.carrierService.searchIdle(
      organisation,
      filter,
    );
    return this.reduceData(results
      .map((i) => {
        return { name: i.carrierId, data: [{ x: i.timestamp, y: i.idle}] };
      }));
  }

  private reduceData(dataSets: DiagramDto[]) {
    return dataSets.reduce((diagrams: DiagramDto[], data: DiagramDto) => {
      const diagram = diagrams.find((d) => d.name == data.name);
      if (!diagram) {
        diagrams.push(data);
      } else {
        diagram.data.push(data.data[0]);
      }
      return diagrams;
    }, []);
  }
}
