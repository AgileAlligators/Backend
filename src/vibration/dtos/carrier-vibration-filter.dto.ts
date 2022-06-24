import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { CarrierTimestampFilterDto } from '../../carrier/dtos/carrier-timestamp-filter.dto';

export class CarrierVibrationFilterDto extends CarrierTimestampFilterDto {
  @IsOptional()
  @Max(1)
  @Min(0)
  @IsNumber()
  minVibration?: number;
}
