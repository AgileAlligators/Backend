import { Module } from '@nestjs/common';
import { DiagramService } from './diagram.service';
import { DiagramController } from './diagram.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LoadDefinition } from 'src/carrier/schemas/Load.schema';
import { IdleDefinition } from 'src/carrier/schemas/Idle.schema';

@Module({
  imports: [MongooseModule.forFeature([LoadDefinition]), MongooseModule.forFeature([IdleDefinition])],
  controllers: [DiagramController],
  providers: [DiagramService],
  exports: [DiagramService],
})
export class DiagramModule {}
