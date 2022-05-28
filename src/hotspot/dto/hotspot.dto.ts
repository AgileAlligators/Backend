import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

export class HotspotDto {
  @ApiProperty({
    description: 'Carrier id',
    example: "123456",
  })
  carrierId: string;

  @ApiProperty({
    description: 'List of data tuples (timestamp, position, requested data)',
    example: [
      [1652394005, { longitude: 0, latitude: 0 }, 0.75],
      [1652399000, { longitude: 0, latitude: 0 }, 0.75],
      [1652399974, { longitude: 0, latitude: 0 }, 0.5],
    ],
  })
  dataTuples: [number, LocationDto, any][];
}
