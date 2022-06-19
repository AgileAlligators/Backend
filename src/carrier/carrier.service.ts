import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InvalidCarrier } from 'src/_common/exceptions/ItemNotFound.exception';
import { SearchResult } from '../_common/search/SearchResult.dto';
import { CarrierFilterDto } from './dtos/carrier-filter.dto';
import { CreateCarrierDto, UpdateCarrierDto } from './dtos/create-carrier.dto';
import { Carrier } from './schemas/Carrier.schema';

@Injectable()
export class CarrierService {
  constructor(
    @InjectModel(Carrier.name) private readonly carrierModel: Model<Carrier>,
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

  public async getUnique(
    organisation: string,
    field: string,
    filter?: CarrierFilterDto,
  ): Promise<string[]> {
    const { fq } = this.getFilterOptions(organisation, filter);
    return this.carrierModel.find(fq).distinct(field);
  }

  public async getIds(
    organisation: string,
    filter: CarrierFilterDto = {},
    limit?: number,
  ): Promise<string[]> {
    const { fq } = this.getFilterOptions(organisation, filter);
    const ids = await this.carrierModel.find(fq, {}, { limit }).distinct('_id');
    return ids.map((id) => id.toString());
  }

  public async exists(
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
}
