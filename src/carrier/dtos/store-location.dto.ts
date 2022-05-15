import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiCarrierTimestamp } from '../carrier.api';

export class StoreLocationDto {
  @ApiCarrierTimestamp({ required: false })
  @IsOptional()
  @Min(0, { message: 'Der Zeitstempel muss größer als 0 sein' })
  @IsInt({ message: 'Der Zeitstempel muss las ganze Zahl angegeben werden' })
  timestamp?: number;

  @ApiProperty({
    type: Number,
    minimum: -180,
    maximum: 180,
    description: 'Längengrad',
    example: 0,
    required: true,
  })
  @Max(180, { message: 'Der Längengrad darf nicht größer als 180 sein' })
  @Min(-180, { message: 'Der Längengrad darf nicht kleiner als 180 sein' })
  @IsNumber({}, { message: 'Der Längengrad muss als Zahl angegeben werden' })
  longitude: number;

  @ApiProperty({
    type: Number,
    minimum: -90,
    maximum: 90,
    description: 'Breitengrad',
    example: 0,
    required: true,
  })
  @Max(90, { message: 'Der Breitengrad darf nicht größer als 90 sein' })
  @Min(-90, { message: 'Der Breitengrad darf nicht kleiner als -90 sein' })
  @IsNumber({}, { message: 'Der Breitengrad muss als Zahl angegeben werden' })
  latitude: number;
}
