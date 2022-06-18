import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CarrierTimestampFilterDto } from '../../carrier/dtos/carrier-timestamp-filter.dto';
import { CarrierLocationNear } from '../models/carrier-location-near.model';

export class CarrierLocationFilterDto extends CarrierTimestampFilterDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CarrierLocationNear)
  near?: CarrierLocationNear;
}
