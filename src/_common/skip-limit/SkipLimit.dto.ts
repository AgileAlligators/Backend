import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class SkipLimitDto {
  @ApiProperty({
    name: 'limit',
    type: Number,
    description: 'Wie viele Elemente sollen maximal zurück gegeben werden',
    required: false,
    example: 20,
  })
  @IsOptional()
  @Min(1, { message: 'Das Limit muss größer als 0 sein' })
  @IsInt({ message: 'Das Limit muss eine ganze Zahl sein' })
  limit?: number;

  @ApiProperty({
    name: 'skip',
    type: Number,
    description: 'Wie viele Elemente sollen zunächst übersprungen werden',
    required: false,
    example: 0,
  })
  @IsOptional()
  @Min(0, { message: 'Skip muss eine positive Zahl sein' })
  @IsInt({ message: 'Skip muss eine ganze Zahl sein' })
  skip?: number;
}
