import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class DiagramFilterDto {
  @ApiProperty({
    description: 'Carrier ids',
    example: '["123456", "234567"]',
  })
  @IsArray()
  ids: string[];

  @ApiProperty({
    description: 'Type of data that should be aggregated into a diagram',
    example: 'loadOverTime',
  })
  @IsString()
  dataRequest: string;

  @ApiProperty({
    description: 'Start of requested time period',
    example: 1652394005,
  })
  @IsOptional()
  @IsInt()
  start?: number;

  @ApiProperty({
    description: 'End of requested time period',
    example: 1654633109,
  })
  @IsOptional()
  @IsInt()
  end?: number;
}
