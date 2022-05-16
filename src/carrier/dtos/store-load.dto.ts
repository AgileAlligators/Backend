import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiCarrierLoad, ApiCarrierTimestamp } from '../carrier.api';

export class StoreLoadDto {
  @ApiCarrierTimestamp({ required: false })
  @IsOptional()
  @Min(0, { message: 'Der Zeitstempel muss größer als 0 sein' })
  @IsInt({ message: 'Der Zeitstempel muss las ganze Zahl angegeben werden' })
  timestamp?: number;

  @ApiCarrierLoad({ required: true })
  @Max(1, { message: 'Der Beladung darf nicht größer als 1 sein' })
  @Min(0, { message: 'Der Beladung darf nicht kleiner als 0 sein' })
  @IsNumber({}, { message: 'Der Beladung muss in Prozent angegeben werden' })
  @IsNumber()
  load: number;
}
