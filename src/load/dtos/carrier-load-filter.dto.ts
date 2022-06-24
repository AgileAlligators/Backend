import { CarrierTimestampFilterDto } from '../../carrier/dtos/carrier-timestamp-filter.dto';

export class CarrierLoadFilterDto extends CarrierTimestampFilterDto {
  timestamp?: number;
}
