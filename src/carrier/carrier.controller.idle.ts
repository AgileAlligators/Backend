import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROrganisation } from 'src/account/decorators/account.decorator';
import { Auth } from 'src/account/guards/perms.guard';
import { SearchResult } from 'src/_common/search/SearchResult.dto';
import { CarrierService } from './carrier.service';
import { CarrierIdleFilterDto } from './dtos/carrier-idle-filter.dto';
import { Idle } from './schemas/Idle.schema';

@Auth()
@ApiTags('Carrier Idle')
@Controller('carrier/idle')
export class CarrierIdleController {
  constructor(private readonly carrierService: CarrierService) {}

  @ApiResponse({ type: [Idle] })
  @Post('search')
  async searchIdle(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierIdleFilterDto,
  ): Promise<SearchResult<Idle>> {
    return this.carrierService.searchIdle(organisation, dto);
  }
}
