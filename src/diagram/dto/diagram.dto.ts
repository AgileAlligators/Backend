import { ApiProperty } from '@nestjs/swagger';

export class DiagramDto {
  @ApiProperty({
    description: 'Carrier id',
    example: "123456",
  })
  name: string;

  @ApiProperty({
    description: 'List of data pairs',
    example: [
      { "x": 1653751519059, "y": 82.83 },
      { "x": 1653751520059, "y": 100.00 },
      { "x": 1653751521059, "y": 62.83 },
    ],
  })
  data: { x: number, y: number}[];
}
