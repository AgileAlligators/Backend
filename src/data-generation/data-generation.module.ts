import { Module } from '@nestjs/common';
import { CarrierModule } from 'src/carrier/carrier.module';
import { DataGenerationController } from './data-generation.controller';
import { DataGenerationService } from './data-generation.service';

@Module({
  imports: [CarrierModule],
  controllers: [DataGenerationController],
  providers: [DataGenerationService],
  exports: [DataGenerationService],
})
export class DataGenerationModule {}
