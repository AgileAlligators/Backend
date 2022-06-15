import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierController } from './carrier.controller';
import { CarrierIdleController } from './carrier.controller.idle';
import { CarrierLoadController } from './carrier.controller.load';
import { CarrierLocationController } from './carrier.controller.location';
import { CarrierVibrationController } from './carrier.controller.vibration';
import { CarrierService } from './carrier.service';
import { CarrierDefinition } from './schemas/Carrier.schema';
import { IdleDefinition } from './schemas/Idle.schema';
import { LoadDefinition } from './schemas/Load.schema';
import { LocationDefinition } from './schemas/Location.schema';
import { VibrationDefinition } from './schemas/Vibration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      CarrierDefinition,
      LocationDefinition,
      LoadDefinition,
      IdleDefinition,
      VibrationDefinition,
    ]),
  ],
  providers: [CarrierService],
  controllers: [
    CarrierLocationController,
    CarrierIdleController,
    CarrierLoadController,
    CarrierVibrationController,
    CarrierController,
  ],
  exports: [CarrierService],
})
export class CarrierModule {}
