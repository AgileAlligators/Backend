import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierModule } from 'src/carrier/carrier.module';
import { IdleDefinition } from 'src/carrier/schemas/Idle.schema';
import { LoadDefinition } from 'src/carrier/schemas/Load.schema';
import { VibrationDefinition } from 'src/carrier/schemas/Vibration.schema';
import { DiagramController } from './diagram.controller';
import { DiagramService } from './diagram.service';

@Module({
  imports: [
    CarrierModule,
    MongooseModule.forFeature([
      LoadDefinition,
      IdleDefinition,
      VibrationDefinition,
    ]),
  ],
  controllers: [DiagramController],
  providers: [DiagramService],
  exports: [DiagramService],
})
export class DiagramModule {}
