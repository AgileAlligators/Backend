import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth, Perms } from 'src/account/guards/perms.guard';
import {
  MongoId,
  MongoIdTypes,
} from 'src/_common/decorators/MongoId.decorator';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierService } from './carrier.service';
import { CarrierLocationFilterDto } from './dtos/carrier-location-filter.dto';
import { StoreLocationDto } from './dtos/store-location.dto';
import { Location } from './schemas/Location.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const LocationId = () => MongoId(MongoIdTypes.LOCATION, 'locationId');

@Auth()
@ApiTags('Carrier Location')
@Controller('carrier/location')
export class CarrierLocationController {
  constructor(private readonly carrierService: CarrierService) {}

  @Perms('carrier.location.create')
  @ApiResponse({ type: Location })
  @Post(':carrierId')
  async storeLocation(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLocationDto,
  ): Promise<Location> {
    return this.carrierService.storeLocation(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Location] })
  @Post('search')
  async searchLocation(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    return this.carrierService.searchLocation(organisation, dto);
  }

  @Perms('carrier.location.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:locationId')
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
