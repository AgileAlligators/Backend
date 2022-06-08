import { Module } from '@nestjs/common';
import { CarrierModule } from 'src/carrier/carrier.module';
import { DiagramController } from './diagram.controller';
import { DiagramService } from './diagram.service';

@Module({
  imports: [CarrierModule],
  controllers: [DiagramController],
  providers: [DiagramService],
  exports: [DiagramService],
})
export class DiagramModule {}
