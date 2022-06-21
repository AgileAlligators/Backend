import { Module } from '@nestjs/common';
import { CarrierModule } from 'src/carrier/carrier.module';
import { LoadModule } from 'src/load/load.module';
import { LocationModule } from 'src/location/location.module';
import { VibrationModule } from 'src/vibration/vibration.module';
import { DataGenerationController } from './data-generation.controller';
import { DataGenerationService } from './data-generation.service';

@Module({
  imports: [CarrierModule, LocationModule, LoadModule, VibrationModule],
  controllers: [DataGenerationController],
  providers: [DataGenerationService],
  exports: [DataGenerationService],
})
export class DataGenerationModule {}
