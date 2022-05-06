import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InvalidCarrier } from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from '../_common/search/SearchResult.dto';
import { CarrierFilterDto } from './dtos/carrier-filter.dto';
import { CreateCarrierDto, UpdateCarrierDto } from './dtos/create-carrier.dto';
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

  public async search(
    organisation: string,
    filter?: CarrierFilterDto,
  ): Promise<SearchResult<Carrier>> {
    const { limit, skip, customers, ids, orders, types } = filter || {};
    const qo: QueryOptions = { sort: { _id: 1 }, limit, skip };
    const fq: FilterQuery<Carrier> = {};

    if (customers !== undefined) fq.customer = { $in: customers };
    if (orders !== undefined) fq.order = { $in: orders };
    if (types !== undefined) fq.type = { $in: types };
    if (ids !== undefined) fq._id = { $in: ids };

    return {
      total: await this.carrierModel.countDocuments(fq),
      results: await this.carrierModel.find(fq, undefined, qo),
    };
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
}
