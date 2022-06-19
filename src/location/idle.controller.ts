import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth } from 'src/account/guards/perms.guard';
import { DiagramFilterDto } from 'src/_common/dto/diagram-filter.dto';
import { DiagramDto } from 'src/_common/dto/diagram.dto';
import { HotspotFilterDto } from 'src/_common/dto/hotspot-filter.dto';
import { HotspotDto } from 'src/_common/dto/hotspot.dto';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierIdleFilterDto } from './dtos/carrier-idle-filter.dto';
import { IdleService } from './idle.service';
import { Idle } from './schemas/Idle.schema';

// const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');

@Auth()
@ApiTags('Location')
@Controller('location/idle')
export class IdleController {
  constructor(private readonly idleService: IdleService) {}

  @ApiResponse({ type: [Idle] })
  @Post('search')
  async searchIdle(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierIdleFilterDto,
  ): Promise<SearchResult<Idle>> {
    return this.idleService.search(organisation, dto);
  }

  @ApiResponse({ type: [DiagramDto] })
  @Post('diagram')
  async getLoadDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.idleService.getDiagram(organisation, filter);
  }

  @ApiResponse({ type: [HotspotDto] })
  @Post('hotspot')
  async getLoadHotspot(
    @ROrganisation() organisation: string,
    @Body() filter?: HotspotFilterDto,
  ): Promise<HotspotDto[]> {
    return this.idleService.getHotspot(organisation, filter);
  }
}
