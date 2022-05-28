import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Model } from 'mongoose';
import { Idle } from 'src/carrier/schemas/Idle.schema';
import { Load } from 'src/carrier/schemas/Load.schema';
import { Location } from 'src/carrier/schemas/Location.schema';
import {
  InvalidCarrier,
  InvalidDiagrammRequest,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { HotspotFilterDto } from './dto/hotspot-filter.dto';
import { HotspotDto } from './dto/hotspot.dto';

const DATA_REQUEST_TYPES = ['load, idle'];

@Injectable()
export class HotspotService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
    @InjectModel(Load.name) private readonly loadModel: Model<Load>,
    @InjectModel(Idle.name) private readonly idleModel: Model<Idle>,
  ) {}

  async getHotspotMap(filter: HotspotFilterDto): Promise<HotspotDto[]> {
    for (const id of filter.ids) {
      if (!isMongoId(id)) throw InvalidCarrier(id);
    }

    if (!DATA_REQUEST_TYPES.includes(filter.dataRequest))
      throw InvalidDiagrammRequest(filter.dataRequest);

    switch (filter.dataRequest) {
      case 'load':
        return await this.getLoad(filter);
      case 'idle':
        return await this.getIdle(filter);
    }
  }

  async getLoad(filter: HotspotFilterDto): Promise<HotspotDto[]> {
    let [load, locations] = await Promise.all([this.loadModel.find(), this.locationModel.find()]);

    load = load.filter((l) => filter.ids.includes(l.carrierId));
    locations = locations.filter((l) => filter.ids.includes(l.carrierId)).sort((a, b) => b.timestamp - a.timestamp);

    load = load.filter(
      (l) => (!filter.start || l.timestamp >= filter.start) && (!filter.end || l.timestamp <= filter.end)
    );

    const hotspots: HotspotDto[] = load
      .map((l) => {
        const locationAtPointOfTime = locations.find((location) => location.timestamp <= l.timestamp);
        return { carrierId: l.carrierId, dataTuples: [[l.timestamp, locationAtPointOfTime, l.load]] };
      })
      .reduce((hotspots: HotspotDto[], load: HotspotDto) => {
        const hotspot = hotspots.find((h) => h.carrierId == load.carrierId);
        if (!hotspot) {
          hotspots.push(load);
        } else {
          hotspot.dataTuples.push(load.dataTuples[0]);
        }
        return hotspots;
      }, []);

    return hotspots;
  }

  async getIdle(filter: HotspotFilterDto): Promise<HotspotDto[]> {
    let [idle, locations] = await Promise.all([this.idleModel.find(), this.locationModel.find()]);

    idle = idle.filter((i) => filter.ids.includes(i.carrierId)).sort((a, b) => b.timestamp - a.timestamp);
    locations = locations.filter((l) => filter.ids.includes(l.carrierId)).sort((a, b) => b.timestamp - a.timestamp);

    idle = idle.filter(
      (i) => (!filter.start || i.timestamp >= filter.start) && (!filter.end || i.timestamp <= filter.end)
    );

    const hotspots: HotspotDto[] = idle
      .map((i) => {
        const locationAtPointOfTime = locations.find((location) => location.timestamp <= i.timestamp);
        return { carrierId: i.carrierId, dataTuples: [[i.timestamp, locationAtPointOfTime, i.idle]] };
      })
      .reduce((hotspots: HotspotDto[], idle: HotspotDto) => {
        const hotspot = hotspots.find((h) => h.carrierId == idle.carrierId);
        if (!hotspot) {
          hotspots.push(idle);
        } else {
          hotspot.dataTuples.push(idle.dataTuples[0]);
        }
        return hotspots;
      }, []);

    return hotspots;
  }
}
