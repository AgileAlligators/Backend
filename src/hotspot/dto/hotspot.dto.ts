import { ApiProperty } from '@nestjs/swagger';

export class HotspotDto {
  @ApiProperty({
    description: 'Carrier id',
    example: '123456',
  })
  carrierId: string;

  @ApiProperty({
    description: 'List of data tuples (timestamp, position, requested data)',
    example: [
      [1652394005, [0, 0], 0.75],
      [1652399000, [0, 0], 0.75],
      [1652399974, [0, 0], 0.5],
    ],
  })
  dataTuples: [number, [number, number], any][];
}
