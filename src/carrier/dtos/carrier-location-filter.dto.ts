import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CarrierLocationNearFilterDto } from './carrier-location-near-filter.dto';
import { CarrierTimestampFilterDto } from './carrier-timestamp-filter.dto';

export class CarrierLocationFilterDto extends CarrierTimestampFilterDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CarrierLocationNearFilterDto)
  near?: CarrierLocationNearFilterDto;
}
