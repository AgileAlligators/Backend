import { ApiProperty } from '@nestjs/swagger';

export class SearchResult<T> {
  @ApiProperty({
    type: Number,
    example: 174,
    description:
      'Wie viele Elemente existieren insgesamt (ohne skip und limit)',
  })
  total: number;

  @ApiProperty({ example: [], description: 'Gefundene Elemente' })
  results: T[];
}
