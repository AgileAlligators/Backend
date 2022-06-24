import { IsNumber, IsOptional, Min } from 'class-validator';
import { CarrierTimestampFilterDto } from '../../carrier/dtos/carrier-timestamp-filter.dto';

export class CarrierIdleFilterDto extends CarrierTimestampFilterDto {
  @IsOptional()
  @Min(0)
  @IsNumber()
  minIdle?: number;
}
