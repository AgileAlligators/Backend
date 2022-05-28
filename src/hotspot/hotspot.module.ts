import { Module } from '@nestjs/common';
import { HotspotService } from './hotspot.service';
import { HotspotController } from './hotspot.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LoadDefinition } from 'src/carrier/schemas/Load.schema';
import { IdleDefinition } from 'src/carrier/schemas/Idle.schema';
import { LocationDefinition } from 'src/carrier/schemas/Location.schema';

@Module({
  imports: [MongooseModule.forFeature([LoadDefinition]), MongooseModule.forFeature([IdleDefinition]), MongooseModule.forFeature([LocationDefinition])],
  controllers: [HotspotController],
  providers: [HotspotService],
  exports: [HotspotService],
})
export class HotspotModule {}
