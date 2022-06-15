import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth, Perms } from 'src/account/guards/perms.guard';
import {
  MongoId,
  MongoIdTypes,
} from 'src/_common/decorators/MongoId.decorator';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierService } from './carrier.service';
import { CarrierFilterDto } from './dtos/carrier-filter.dto';
import { CreateCarrierDto, UpdateCarrierDto } from './dtos/create-carrier.dto';
import { Carrier } from './schemas/Carrier.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');

@Auth()
@ApiTags('Carrier')
@Controller('carrier')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @ApiResponse({ type: [String] })
  @Get('customers')
  async getUniqueCustomers(
    @ROrganisation() organisation: string,
  ): Promise<string[]> {
    return this.carrierService.getUnique(organisation, 'customer');
  }

  @ApiResponse({ type: [String] })
  @Get('orders')
  async getUniqueOrders(
    @ROrganisation() organisation: string,
  ): Promise<string[]> {
    return this.carrierService.getUnique(organisation, 'order');
  }

  @ApiResponse({ type: [String] })
  @Get('types')
  async getUniqueTypes(
    @ROrganisation() organisation: string,
  ): Promise<string[]> {
    return this.carrierService.getUnique(organisation, 'type');
  }

  @ApiResponse({ type: [String] })
  @Get('components')
  async getUniqueComponents(
    @ROrganisation() organisation: string,
  ): Promise<string[]> {
    return this.carrierService.getUnique(organisation, 'component');
  }

  @ApiResponse({ type: [Carrier] })
  @Post('search')
  async searchCarriers(
    @ROrganisation() organisation: string,
    @Body() filter?: CarrierFilterDto,
  ): Promise<SearchResult<Carrier>> {
    return this.carrierService.search(organisation, filter);
  }

  @ApiResponse({ type: Carrier })
  @Get(':carrierId')
  async getCarrier(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
  ): Promise<Carrier> {
    return this.carrierService.getById(organisation, carrierId);
  }

  @Perms('carrier.create')
  @ApiResponse({ type: Carrier })
  @Post('')
  async createCarrier(
    @ROrganisation() organisation: string,
    @Body() dto: CreateCarrierDto,
  ): Promise<Carrier> {
    return this.carrierService.create(organisation, dto);
  }

  @Perms('carrier.update')
  @ApiResponse({ type: Carrier })
  @Patch(':carrierId')
  async updateCarrier(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: UpdateCarrierDto,
  ): Promise<Carrier> {
    return this.carrierService.update(organisation, carrierId, dto);
  }

  @Perms('carrier.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId')
  async deleteCarrier(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
  ): Promise<boolean> {
    return this.carrierService.delete(organisation, carrierId);
  }
}
