import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CarrierFilterDto } from './carrier-filter.dto';

export abstract class CarrierTimestampFilterDto extends CarrierFilterDto {
  @ApiProperty({
    type: Number,
    example: 0,
    required: false,
    description: 'Ab welchem Zeitpunkt sollen die Daten gesammelt werden',
    minimum: 0,
  })
  @IsOptional()
  @Min(0, { message: 'Der Startzeitpunkt muss größer als 0 sein' })
  @IsInt({ message: 'Der Startzeitpunkt muss eine Zahl sein' })
  timestamp_start?: number;

  @ApiProperty({
    type: Number,
    example: Date.now(),
    required: false,
    description: 'Bis zu welchem Zeitpunkt sollen die Daten gesammelt werden',
    minimum: 0,
  })
  @IsOptional()
  @Min(0, { message: 'Der Startzeitpunkt muss größer als 0 sein' })
  @IsInt({ message: 'Der Startzeitpunkt muss eine Zahl sein' })
  timestamp_end?: number;
}
