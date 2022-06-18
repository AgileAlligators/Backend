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
import { CarrierVibrationFilterDto } from './dtos/carrier-vibration-filter.dto';
import { StoreVibrationDto } from './dtos/store-vibration.dto';
import { Vibration } from './schemas/Vibration.schema';
import { VibrationService } from './vibration.service';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const VibrationId = () => MongoId(MongoIdTypes.VIBRATION, 'vibrationId');

@Auth()
@ApiTags('Vibration')
@Controller('vibration')
export class VibrationController {
  constructor(private readonly vibrationService: VibrationService) {}

  @Perms('carrier.vibration.create')
  @ApiResponse({ type: Vibration })
  @Post(':carrierId')
  async storeVibration(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreVibrationDto,
  ): Promise<Vibration> {
    return this.vibrationService.store(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Vibration] })
  @Post('search')
  async searchVibration(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierVibrationFilterDto,
  ): Promise<SearchResult<Vibration>> {
    return this.vibrationService.search(organisation, dto);
  }

  @Perms('carrier.vibration.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:vibrationId')
  async deleteVibration(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @VibrationId() vibrationId: string,
  ): Promise<boolean> {
    return this.vibrationService.delete(organisation, carrierId, vibrationId);
  }

  @ApiResponse({ type: [DiagramDto] })
  @Post('diagram')
  async getLoadDiagram(
    @Body() filter: DiagramFilterDto,
    @ROrganisation() organisation: string,
  ): Promise<DiagramDto[]> {
    return this.vibrationService.getDiagram(organisation, filter);
  }
}
