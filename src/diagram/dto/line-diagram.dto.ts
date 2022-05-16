import { ApiProperty } from '@nestjs/swagger';

export class LineDiagramDto {
  @ApiProperty({
    description: 'Carrier id',
    example: "123456",
  })
  carrierId: string;

  @ApiProperty({
    description: 'List of data pairs',
    example: [
      [1652394005, 0.75],
      [1652399000, 0.75],
      [1652399974, 0.5],
    ],
  })
  dataPairs: [any, any][];
}
