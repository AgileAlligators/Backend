import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierModule } from 'src/carrier/carrier.module';
import { LocationModule } from 'src/location/location.module';
import { VibrationDefinition } from './schemas/Vibration.schema';
import { VibrationController } from './vibration.controller';
import { VibrationService } from './vibration.service';

@Module({
  providers: [VibrationService],
  controllers: [VibrationController],
  imports: [
    CarrierModule,
    MongooseModule.forFeature([VibrationDefinition]),
    forwardRef(() => LocationModule),
  ],
  exports: [VibrationService],
})
export class VibrationModule {}
