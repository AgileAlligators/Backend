import { Injectable } from '@nestjs/common';
import { CarrierService } from 'src/carrier/carrier.service';

@Injectable()
export class HotspotService {
  constructor(private readonly carrierService: CarrierService) {}

  // async getLoadMap(
  //   organisation: string,
  //   filter: HotspotFilterDto,
  // ): Promise<HotspotDto[]> {
  //   const [loadResults, locatiionResults] = await Promise.all([
  //     await this.carrierService.searchLoad(organisation, filter),
  //     await this.carrierService.searchLocation(organisation, filter),
  //   ]);

  //   const load = loadResults.results;
  //   const locations = locatiionResults.results;

  //   return this.reduceData(
  //     load.map((l) => {
  //       const locationAtPointOfTime = locations.find(
  //         (location) => location.timestamp <= l.timestamp,
  //       );
  //       return {
  //         carrierId: l.carrierId,
  //         dataTuples: [
  //           [l.timestamp, locationAtPointOfTime.location.coordinates, l.load],
  //         ],
  //       };
  //     }),
  //   );
  // }

  // async getIdleMap(
  //   organisation: string,
  //   filter: HotspotFilterDto,
  // ): Promise<HotspotDto[]> {
  //   const [idleResults, locatiionResults] = await Promise.all([
  //     await this.carrierService.searchIdle(organisation, filter),
  //     await this.carrierService.searchLocation(organisation, filter),
  //   ]);

  //   const idle = idleResults.results;
  //   const locations = locatiionResults.results;

  //   return this.reduceData(
  //     idle.map((i) => {
  //       const locationAtPointOfTime = locations.find(
  //         (location) => location.timestamp <= i.timestamp,
  //       );
  //       return {
  //         carrierId: i.carrierId,
  //         dataTuples: [
  //           [i.timestamp, locationAtPointOfTime.location.coordinates, i.idle],
  //         ],
  //       };
  //     }),
  //   );
  // }

  // private reduceData(data: HotspotDto[]): HotspotDto[] {
  //   return data.reduce((hotspots: HotspotDto[], load: HotspotDto) => {
  //     const hotspot = hotspots.find((h) => h.carrierId == load.carrierId);
  //     if (!hotspot) {
  //       hotspots.push(load);
  //     } else {
  //       hotspot.dataTuples.push(load.dataTuples[0]);
  //     }
  //     return hotspots;
  //   }, []);
  // }
}
