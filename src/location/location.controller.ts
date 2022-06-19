import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth, Perms } from 'src/account/guards/perms.guard';
import {
  MongoId,
  MongoIdTypes,
} from 'src/_common/decorators/MongoId.decorator';
import { HotspotFilterDto } from 'src/_common/dto/hotspot-filter.dto';
import { HotspotDto } from 'src/_common/dto/hotspot.dto';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierLocationFilterDto } from './dtos/carrier-location-filter.dto';
import { StoreLocationDto } from './dtos/store-location.dto';
import { LocationService } from './location.service';
import { Location } from './schemas/Location.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const LocationId = () => MongoId(MongoIdTypes.LOCATION, 'locationId');

@Auth()
@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiResponse({ type: [HotspotDto] })
  @Post('hotspot')
  async getLoadHotspot(
    @ROrganisation() organisation: string,
    @Body() filter?: HotspotFilterDto,
  ): Promise<HotspotDto[]> {
    return this.locationService.getHotspot(organisation, filter);
  }

  @ApiResponse({ type: [Location] })
  @Post('search')
  async searchLocation(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLocationFilterDto,
  ): Promise<SearchResult<Location>> {
    return this.locationService.search(organisation, dto);
  }

  @Perms('carrier.location.create')
  @ApiResponse({ type: Location })
  @Post(':carrierId')
  async storeLocation(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLocationDto,
  ): Promise<Location> {
    return this.locationService.store(organisation, carrierId, dto);
  }

  @Perms('carrier.location.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:locationId')
  async deleteLocation(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @LocationId() locationId: string,
  ): Promise<boolean> {
    return this.locationService.delete(organisation, carrierId, locationId);
  }
}
