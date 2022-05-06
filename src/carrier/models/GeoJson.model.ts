import { ApiProperty } from '@nestjs/swagger';

export class GeoJSON {
  @ApiProperty({ description: 'Art der Koordinate' })
  type: 'Point';

  @ApiProperty({
    type: [Number, Number],
    description:
      'Koordinaten (longitude [-180 bis 180], latitude [-90 bis 90])',
  })
  coordinates: [number, number];
}
