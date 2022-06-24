import { CarrierTimestampFilterDto } from '../../carrier/dtos/carrier-timestamp-filter.dto';

export class CarrierIdleFilterDto extends CarrierTimestampFilterDto {
  minIdle?: number;
}
