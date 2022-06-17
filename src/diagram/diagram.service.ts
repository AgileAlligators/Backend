import { Injectable } from '@nestjs/common';
import { CarrierService } from 'src/carrier/carrier.service';
import { DiagramFilterDto } from './dto/diagram-filter.dto';
import { DiagramDto } from './dto/diagram.dto';

@Injectable()
export class DiagramService {
  constructor(private readonly carrierService: CarrierService) {}

  public async getLoadOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { results } = await this.carrierService.searchLoad(
      organisation,
      filter,
    );

    const reducedData = this.reduceData(
      results.map((l) => {
        return { name: l.carrierId, data: [{ x: l.timestamp, y: l.load }] };
      }),
    );

    return reducedData.length <= 10
      ? reducedData
      : this.calculateAverage(reducedData);
  }

  public async getIdleOverTime(
    organisation: string,
    filter: DiagramFilterDto,
  ): Promise<DiagramDto[]> {
    const { results } = await this.carrierService.searchIdle(
      organisation,
      filter,
    );

    const reducedData = this.reduceData(
      results.map((i) => {
        return { name: i.carrierId, data: [{ x: i.timestamp, y: i.idle }] };
      }),
    );

    return reducedData.length <= 10
      ? reducedData
      : this.calculateAverage(reducedData);
  }

  private reduceData(dataSets: DiagramDto[]): DiagramDto[] {
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

  private calculateAverage(dataSets: DiagramDto[]): DiagramDto[] {
    return [
      dataSets.reduce(
        (diagram: DiagramDto, data: DiagramDto) => {
          for (const dataEntry of data.data) {
            const entry = diagram.data.find((d) => d.x == dataEntry.x);
            if (!!entry) {
              entry.y += dataEntry.y / dataSets.length;
            } else {
              diagram.data.push({
                x: dataEntry.x,
                y: dataEntry.y / dataSets.length,
              });
            }
          }

          return diagram;
        },
        { name: 'average', data: [] },
      ),
    ];
  }
}
