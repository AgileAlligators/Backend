import { Module } from '@nestjs/common';
import { HotspotService } from './hotspot.service';
import { HotspotController } from './hotspot.controller';
import { CarrierModule } from 'src/carrier/carrier.module';

@Module({
  imports: [CarrierModule],
  controllers: [HotspotController],
  providers: [HotspotService],
  exports: [HotspotService],
})
export class HotspotModule {}
