import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { noop } from 'rxjs';
import { CarrierService } from 'src/carrier/carrier.service';
import {
  InvalidCarrier,
  InvalidLocation,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierLocationFilterDto } from './dtos/carrier-location-filter.dto';
import { StoreLocationDto } from './dtos/store-location.dto';
import { IdleService } from './idle.service';
import { Location } from './schemas/Location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationModel: Model<Location>,
    private readonly carrierService: CarrierService,
    private readonly idleService: IdleService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreLocationDto,
  ): Promise<Location> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const { timestamp, longitude, latitude } = dto;
    const location = await this.locationModel.create({
      carrierId,
      timestamp,
      location: { type: 'Point', coordinates: [longitude, latitude] },
    });

    this.idleService.syncIdle(carrierId).then(noop);

    return location;
  }

  public async search(
    organisation: string,
    dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    const { end, start, near, skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Location> = { carrierId: { $in: ids } };

    if (start !== undefined) fq.timestamp = { $gte: start };
    if (end !== undefined) {
      if (fq.timestamp) fq.timestamp.$lte = end;
      else fq.timestamp = { $lte: end };
    }

    if (near !== undefined) {
      fq.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [near.longitude, near.latitude],
          },
          $maxDistance: near.radius,
        },
      };
    }

    return {
      total: await this.locationModel.countDocuments(fq),
      results: await this.locationModel.find(fq, undefined, qo),
    };
  }

  public async delete(
    organisation: string,
    carrierId: string,
    locationId: string,
  ): Promise<boolean> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const res = await this.locationModel.deleteOne({
      _id: locationId,
      carrierId,
    });

    if (res.deletedCount === 0) throw InvalidLocation(locationId);

    this.idleService.syncIdle(carrierId).then(noop);

    return true;
  }
}
