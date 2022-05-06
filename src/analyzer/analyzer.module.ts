import { Module } from '@nestjs/common';
import { CarrierModule } from 'src/carrier/carrier.module';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';

@Module({
  imports: [CarrierModule],
  providers: [AnalyzerService],
  controllers: [AnalyzerController],
})
export class AnalyzerModule {}
