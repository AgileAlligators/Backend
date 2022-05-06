import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierController } from './carrier.controller';
import { CarrierService } from './carrier.service';
import { CarrierDefinition } from './schemas/Carrier.schema';
import { LoadDefinition } from './schemas/Load.schema';
import { LocationDefinition } from './schemas/Location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      CarrierDefinition,
      LocationDefinition,
      LoadDefinition,
    ]),
  ],
  providers: [CarrierService],
  controllers: [CarrierController],
  exports: [CarrierService],
})
export class CarrierModule {}
