import { ApiProperty } from '@nestjs/swagger';
import { ApiCarrierId } from 'src/carrier/carrier.api';

export class DiagramDto {
  @ApiCarrierId()
  name: string;

  @ApiProperty({
    description: 'List of data pairs',
    example: [
      { x: 1653751519059, y: 82.83 },
      { x: 1653751520059, y: 100.0 },
      { x: 1653751521059, y: 62.83 },
    ],
  })
  data: ({ x: number; y: number } | number)[];
}
