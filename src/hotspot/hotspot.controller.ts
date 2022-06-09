import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth } from 'src/account/guards/perms.guard';
import { HotspotFilterDto } from './dto/hotspot-filter.dto';
import { HotspotDto } from './dto/hotspot.dto';
import { HotspotService } from './hotspot.service';

@Auth()
@ApiTags('Hotspot')
@Controller('hotspot')
export class HotspotController {
  constructor(private readonly hotspotService: HotspotService) {}

  @ApiOperation({ description: 'Create a load hotspot map with given filter' })
  @ApiResponse({
    type: [HotspotDto],
    description: 'Returns the requested data for a load hotspot map',
  })
  @ApiBody({
    type: HotspotFilterDto,
    required: true,
  })
  @Post('load')
  getLoadHotspotMap(
    @Body() filter: HotspotFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<HotspotDto[]> {
    return this.hotspotService.getLoadMap(organisation, filter);
  }

  @ApiOperation({ description: 'Create a idle hotspot map with given filter' })
  @ApiResponse({
    type: [HotspotDto],
    description: 'Returns the requested data for a idle hotspot map',
  })
  @ApiBody({
    type: HotspotFilterDto,
    required: true,
  })
  @Post('idle')
  getIdleHotspotMap(
    @Body() filter: HotspotFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<HotspotDto[]> {
    return this.hotspotService.getIdleMap(organisation, filter);
  }
}
