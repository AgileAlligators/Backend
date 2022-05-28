import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/account/guards/perms.guard';
import { HotspotFilterDto } from './dto/hotspot-filter.dto';
import { HotspotDto } from './dto/hotspot.dto';
import { HotspotService } from './hotspot.service';

@Auth()
@ApiTags('Hotspot')
@Controller('hotspot')
export class HotspotController {
  constructor(private readonly hotspotService: HotspotService) {}

  @ApiOperation({ description: 'Create a hotspot map with given filter' })
  @ApiResponse({
    type: HotspotDto,
    description: 'Returns the requested data for a hotspot map',
  })
  @ApiBody({
    type: HotspotFilterDto,
    required: true,
  })
  @Post('/hotspot')
  getLineDiagram(@Body() filter: HotspotFilterDto): Promise<HotspotDto[]> {
    return this.hotspotService.getHotspotMap(filter);
  }
}
