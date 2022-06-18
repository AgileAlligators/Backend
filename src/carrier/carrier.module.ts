import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierController } from './carrier.controller';
import { CarrierService } from './carrier.service';
import { CarrierDefinition } from './schemas/Carrier.schema';

@Module({
  imports: [MongooseModule.forFeature([CarrierDefinition])],
  providers: [CarrierService],
  controllers: [CarrierController],
  exports: [CarrierService],
})
export class CarrierModule {}
