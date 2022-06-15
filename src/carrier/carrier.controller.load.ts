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
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { Load } from './schemas/Load.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const LoadId = () => MongoId(MongoIdTypes.LOAD, 'loadId');

@Auth()
@ApiTags('Carrier Load')
@Controller('carrier/load')
export class CarrierLoadController {
  constructor(private readonly carrierService: CarrierService) {}

  @Perms('carrier.load.create')
  @ApiResponse({ type: Load })
  @Post(':carrierId')
  async storeLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLoadDto,
  ): Promise<Load> {
    return this.carrierService.storeLoad(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Load] })
  @Post('search')
  async searchLoad(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    return this.carrierService.searchLoad(organisation, dto);
  }

  @Perms('carrier.load.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:loadId')
  async deleteLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @LoadId() loadId: string,
  ): Promise<boolean> {
    return this.carrierService.deleteLoad(organisation, carrierId, loadId);
  }
}
