import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import {
  ApiCarrierTimestamp,
  ApiCarrierVibration,
} from '../../carrier/carrier.api';

export class StoreVibrationDto {
  @ApiCarrierTimestamp({ required: false })
  @IsOptional()
  @Min(0, { message: 'Der Zeitstempel muss größer als 0 sein' })
  @IsInt({ message: 'Der Zeitstempel muss als ganze Zahl angegeben werden' })
  timestamp?: number;

  @ApiCarrierVibration({ required: true })
  @Min(0, { message: 'Die Erschütterung darf nicht kleiner als 0 sein' })
  @IsNumber({}, { message: 'Die Erschütterung muss als Zahl angegeben werden' })
  load: number;
}
