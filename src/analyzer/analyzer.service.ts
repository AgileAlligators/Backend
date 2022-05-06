import { Injectable } from '@nestjs/common';
import { CarrierService } from 'src/carrier/carrier.service';

@Injectable()
export class AnalyzerService {
  constructor(private readonly carrierService: CarrierService) {}
}
