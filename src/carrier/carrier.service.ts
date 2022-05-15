import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import {
  InvalidCarrier,
  InvalidLoad,
  InvalidLocation,
} from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from '../_common/search/SearchResult.dto';
import { CarrierFilterDto } from './dtos/carrier-filter.dto';
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { CarrierLocationFilterDto } from './dtos/carrier-location-filter.dto';
import { CreateCarrierDto, UpdateCarrierDto } from './dtos/create-carrier.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { StoreLocationDto } from './dtos/store-location.dto';
import { Carrier } from './schemas/Carrier.schema';
import { Load } from './schemas/Load.schema';
import { Location } from './schemas/Location.schema';

@Injectable()
export class CarrierService {
  constructor(
    @InjectModel(Carrier.name) private readonly carrierModel: Model<Carrier>,
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
    @InjectModel(Load.name) private readonly loadModel: Model<Load>,
  ) {}

  private getFilterOptions(
    organisation: string,
    filter?: CarrierFilterDto,
  ): { qo: QueryOptions; fq: FilterQuery<Carrier> } {
    const { limit, skip, customers, ids, orders, types } = filter || {};
    const qo: QueryOptions = { sort: { _id: 1 }, limit, skip };
    const fq: FilterQuery<Carrier> = { _organisation: organisation };

    if (customers !== undefined) fq.customer = { $in: customers };
    if (orders !== undefined) fq.order = { $in: orders };
    if (types !== undefined) fq.type = { $in: types };
    if (ids !== undefined) fq._id = { $in: ids };
    return { fq, qo };
  }

  public async search(
    organisation: string,
    filter?: CarrierFilterDto,
  ): Promise<SearchResult<Carrier>> {
    const { fq, qo } = this.getFilterOptions(organisation, filter);

    return {
      total: await this.carrierModel.countDocuments(fq),
      results: await this.carrierModel.find(fq, undefined, qo),
    };
  }

  public async doesCarrierExist(
    organisation: string,
    carrierId: string,
  ): Promise<boolean> {
    if (!isMongoId(carrierId)) return false;

    const carrier = await this.carrierModel.findOne({
      _id: carrierId,
      _organisation: organisation,
    });
    return !!carrier;
  }

  public async getById(
    organisation: string,
    carrierId: string,
  ): Promise<Carrier> {
    if (!isMongoId(carrierId)) throw InvalidCarrier(carrierId);

    const carrier = await this.carrierModel.findOne({
      _id: carrierId,
      _organisation: organisation,
    });

    if (carrier) return carrier;
    throw InvalidCarrier(carrierId);
  }

  public async create(
    organisation: string,
    dto: CreateCarrierDto,
  ): Promise<Carrier> {
    return this.carrierModel.create({ ...dto, _organisation: organisation });
  }

  public async update(
    organisation: string,
    carrierId: string,
    dto: UpdateCarrierDto,
  ): Promise<Carrier> {
    if (!isMongoId(carrierId)) throw InvalidCarrier(carrierId);

    const carrier = await this.carrierModel.findOneAndUpdate(
      { _id: carrierId, _organisation: organisation },
      { $set: dto },
      { new: true, useFindAndModify: false },
    );

    if (carrier) return carrier;
    throw InvalidCarrier(carrierId);
  }

  public async delete(
    organisation: string,
    carrierId: string,
  ): Promise<boolean> {
    if (!isMongoId(carrierId)) throw InvalidCarrier(carrierId);

    const res = await this.carrierModel.deleteOne({
      _id: carrierId,
      _organisation: organisation,
    });

    if (res.deletedCount === 0) throw InvalidCarrier(carrierId);
    return true;
  }

  // ========================================
  // Load
  // ========================================

  public async storeLoad(
    organisation: string,
    carrierId: string,
    dto: StoreLoadDto,
  ): Promise<Load> {
    if (!(await this.doesCarrierExist(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    return this.loadModel.create({ carrierId, ...dto });
  }

  public async searchLoad(
    organisation: string,
    dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    const { timestamp_end, timestamp_start, skip, limit } = dto;
    const { fq, qo } = this.getFilterOptions(organisation, {
      ...dto,
      skip: undefined,
      limit: undefined,
    });

    const ids = await this.carrierModel
      .find(fq, undefined, qo)
      .distinct<string>('_id');

    const qoL: QueryOptions = { sort: { _id: 1 }, limit, skip };
    const fqL: FilterQuery<Load> = { carrierId: { $in: ids } };

    if (timestamp_start !== undefined)
      fqL.timestamp = { $gte: timestamp_start };
    if (timestamp_end !== undefined) fqL.timestamp = { $lte: timestamp_end };

    return {
      total: await this.loadModel.countDocuments(fqL),
      results: await this.loadModel.find(fqL, undefined, qoL),
    };
  }

  public async deleteLoad(
    organisation: string,
    carrierId: string,
    loadId: string,
  ): Promise<boolean> {
    if (!(await this.doesCarrierExist(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const res = await this.loadModel.deleteOne({ _id: loadId, carrierId });

    if (res.deletedCount === 0) throw InvalidLoad(loadId);
    return true;
  }

  // ========================================
  // Location
  // ========================================

  public async storeLocation(
    organisation: string,
    carrierId: string,
    dto: StoreLocationDto,
  ): Promise<Location> {
    if (!(await this.doesCarrierExist(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const { timestamp, longitude, latitude } = dto;
    return this.locationModel.create({
      carrierId,
      timestamp,
      location: { type: 'Point', coordinates: [longitude, latitude] },
    });
  }

  public async searchLocation(
    organisation: string,
    dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    const { timestamp_end, timestamp_start, skip, limit } = dto;
    const { fq, qo } = this.getFilterOptions(organisation, {
      ...dto,
      skip: undefined,
      limit: undefined,
    });

    const ids = await this.carrierModel
      .find(fq, undefined, qo)
      .distinct<string>('_id');

    const qoL: QueryOptions = { sort: { _id: 1 }, limit, skip };
    const fqL: FilterQuery<Location> = { carrierId: { $in: ids } };

    if (timestamp_start !== undefined)
      fqL.timestamp = { $gte: timestamp_start };
    if (timestamp_end !== undefined) fqL.timestamp = { $lte: timestamp_end };

    return {
      total: await this.locationModel.countDocuments(fqL),
      results: await this.locationModel.find(fqL, undefined, qoL),
    };
  }

  public async deleteLocation(
    organisation: string,
    carrierId: string,
    locationId: string,
  ): Promise<boolean> {
    if (!(await this.doesCarrierExist(organisation, carrierId)))
      throw InvalidCarrier(carrierId);

    const res = await this.locationModel.deleteOne({
      _id: locationId,
      carrierId,
    });

    if (res.deletedCount === 0) throw InvalidLocation(locationId);
    return true;
  }
}
