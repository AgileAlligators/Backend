import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth, Perms } from 'src/account/guards/perms.guard';
import {
  MongoId,
  MongoIdTypes,
} from 'src/_common/decorators/MongoId.decorator';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierLoadFilterDto } from './dtos/carrier-load-filter.dto';
import { StoreLoadDto } from './dtos/store-load.dto';
import { LoadService } from './load.service';
import { Load } from './schemas/Load.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const LoadId = () => MongoId(MongoIdTypes.LOAD, 'loadId');

@Auth()
@ApiTags('Load')
@Controller('load')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Perms('carrier.load.create')
  @ApiResponse({ type: Load })
  @Post(':carrierId')
  async storeLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreLoadDto,
  ): Promise<Load> {
    return this.loadService.store(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Load] })
  @Post('search')
  async searchLoad(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierLoadFilterDto,
  ): Promise<SearchResult<Load>> {
    return this.loadService.search(organisation, dto);
  }

  @Perms('carrier.load.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:loadId')
  async deleteLoad(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @LoadId() loadId: string,
  ): Promise<boolean> {
    return this.loadService.delete(organisation, carrierId, loadId);
  }

  @ApiResponse({ type: [DiagramDto] })
  @Post('diagram')
  async getLoadDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.loadService.getDiagram(organisation, filter);
  }
}
