import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierModule } from 'src/carrier/carrier.module';
import { LoadModule } from 'src/load/load.module';
import { VibrationModule } from 'src/vibration/vibration.module';
import { IdleController } from './idle.controller';
import { IdleService } from './idle.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { IdleDefinition } from './schemas/Idle.schema';
import { LocationDefinition } from './schemas/Location.schema';

@Module({
  controllers: [IdleController, LocationController],
  providers: [IdleService, LocationService],
  imports: [
    CarrierModule,
    MongooseModule.forFeature([LocationDefinition, IdleDefinition]),
    forwardRef(() => VibrationModule),
    forwardRef(() => LoadModule),
  ],
  exports: [LocationService],
})
export class LocationModule {}
