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
import { CarrierVibrationFilterDto } from './dtos/carrier-vibration-filter.dto';
import { StoreVibrationDto } from './dtos/store-vibration.dto';
import { Vibration } from './schemas/Vibration.schema';

const CarrierId = () => MongoId(MongoIdTypes.CARRIER, 'carrierId');
const VibrationId = () => MongoId(MongoIdTypes.VIBRATION, 'vibrationId');

@Auth()
@ApiTags('Carrier Vibration')
@Controller('carrier/vibration')
export class CarrierVibrationController {
  constructor(private readonly carrierService: CarrierService) {}

  @Perms('carrier.vibration.create')
  @ApiResponse({ type: Vibration })
  @Post(':carrierId')
  async storeVibration(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @Body() dto: StoreVibrationDto,
  ): Promise<Vibration> {
    return this.carrierService.storeVibration(organisation, carrierId, dto);
  }

  @ApiResponse({ type: [Vibration] })
  @Post('search')
  async searchVibration(
    @ROrganisation() organisation: string,
    @Body() dto: CarrierVibrationFilterDto,
  ): Promise<SearchResult<Vibration>> {
    return this.carrierService.searchVibration(organisation, dto);
  }

  @Perms('carrier.vibration.delete')
  @ApiResponse({ type: Boolean })
  @Delete(':carrierId/:vibrationId')
  async deleteVibration(
    @ROrganisation() organisation: string,
    @CarrierId() carrierId: string,
    @VibrationId() vibrationId: string,
  ): Promise<boolean> {
    return this.carrierService.deleteVibration(
      organisation,
      carrierId,
      vibrationId,
    );
  }
}
