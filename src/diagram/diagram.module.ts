import { Module } from '@nestjs/common';
import { DiagramService } from './diagram.service';
import { DiagramController } from './diagram.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LoadDefinition } from 'src/carrier/schemas/Load.schema';

@Module({
  imports: [MongooseModule.forFeature([LoadDefinition])],
  controllers: [DiagramController],
  providers: [DiagramService],
  exports: [DiagramService],
})
export class DiagramModule {}
