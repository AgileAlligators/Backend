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
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { CarrierLocationFilterDto } from './dtos/carrier-location-filter.dto';
import { CreateCarrierDto, UpdateCarrierDto } from './dtos/create-carrier.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { StoreLocationDto } from './dtos/store-location.dto';
import { Carrier } from './schemas/Carrier.schema';
import { Load } from './schemas/Load.schema';
import { Location } from './schemas/Location.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const LocationId = () => MongoId(MongoIdTypes.LOCATION, 'locationId');
const LoadId = () => MongoId(MongoIdTypes.LOAD, 'loadId');

@Auth()
@ApiTags('Carrier')
@Controller('carrier')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

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

  @Perms('carrier.load.create')
  @ApiResponse({ type: Load })
  @Post(':carrierId/load')
  async storeLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLoadDto,
  ): Promise<Load> {
    return this.carrierService.storeLoad(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Load] })
  @Post('search/load')
  async searchLoad(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    return this.carrierService.searchLoad(organisation, dto);
  }

  @Perms('carrier.load.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/load/:loadId')
  async deleteLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @LoadId() loadId: string,
  ): Promise<boolean> {
    return this.carrierService.deleteLoad(organisation, carrierId, loadId);
  }

  @Perms('carrier.location.create')
  @ApiResponse({ type: Location })
  @Post(':carrierId/location')
  async storeLocation(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLocationDto,
  ): Promise<Location> {
    return this.carrierService.storeLocation(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Location] })
  @Post(':carrierId/location/search')
  async searchLocation(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    return this.carrierService.searchLocation(organisation, dto);
  }

  @Perms('carrier.location.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/location/:locationId')
  async deleteLocation(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @LocationId() locationId: string,
  ): Promise<boolean> {
    return this.carrierService.deleteLocation(
      organisation,
      carrierId,
      locationId,
    );
  }
}
