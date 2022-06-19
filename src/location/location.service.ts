import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { noop } from 'rxjs';
import { CarrierService } from 'src/carrier/carrier.service';
import { GeoJSON } from 'src/carrier/models/GeoJson.model';
import { LoadService } from 'src/load/load.service';
import { VibrationService } from 'src/vibration/vibration.service';
import { HotspotFilterDto } from 'src/_common/dto/hotspot-filter.dto';
import { HotspotDto } from 'src/_common/dto/hotspot.dto';
import {
  InvalidCarrier,
  InvalidLocation,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { timestampFilter } from 'src/_common/functions/timestampFilter.function';
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

    @Inject(forwardRef(() => LoadService))
    private readonly loadService: LoadService,
    @Inject(forwardRef(() => VibrationService))
    private readonly vibrationService: VibrationService,
  ) {}

  public async store(
    organisation: string,
    carrierId: string,
    dto: StoreLocationDto,
  ): Promise<Location> {
    if (!(await this.carrierService.exists(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    if (!dto.timestamp) dto.timestamp = Date.now();
    const { timestamp, longitude, latitude } = dto;
    const location = await this.locationModel.create({
      carrierId,
      timestamp,
      location: { type: 'Point', coordinates: [longitude, latitude] },
    });

    await Promise.all([
      this.idleService.sync(carrierId, timestamp),
      this.loadService.sync(carrierId, timestamp),
      this.vibrationService.sync(carrierId, timestamp),
    ]);

    return location;
  }

  public async search(
    organisation: string,
    dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    const { near, skip, limit } = dto;

    const ids = await this.carrierService.getIds(organisation, dto);

    const qo: QueryOptions = { sort: { timestamp: -1 }, limit, skip };
    const fq: FilterQuery<Location> = {
      carrierId: { $in: ids },
      ...timestampFilter(dto),
    };

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

    this.idleService.sync(carrierId).then(noop);

    return true;
  }

  public async getHotspot(
    organisation: string,
    filter?: HotspotFilterDto,
  ): Promise<HotspotDto[]> {
    const ids = await this.carrierService.getIds(organisation, filter, 10);

    const fq: FilterQuery<Location> = {
      carrierId: { $in: ids },
      ...timestampFilter(filter),
    };

    return this.locationModel.aggregate([
      {
        $match: { ...fq, carrierId: { $in: ids } },
      },
      {
        $group: {
          _id: '$carrierId',
          dataTuples: {
            $push: {
              $concatArrays: [['$timestamp'], ['$location.coordinates'], [1]],
            },
          },
        },
      },
    ]);
  }

  public async getClosestTo(
    carrierId: string,
    timestamp: number,
  ): Promise<GeoJSON | null> {
    const locations: { location: GeoJSON }[] =
      await this.locationModel.aggregate([
        { $match: { carrierId: carrierId } },
        {
          $project: {
            diff: { $abs: { $subtract: [timestamp, '$timestamp'] } },
            location: '$location',
          },
        },
        { $sort: { diff: 1 } },
        { $limit: 1 },
      ]);

    return locations[0] ? locations[0].location : null;
  }
}
