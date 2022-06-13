import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CarrierFilterDto } from 'src/carrier/dtos/carrier-filter.dto';

export class HotspotFilterDto extends CarrierFilterDto {
  @ApiProperty({
    description: 'Start of requested time period',
    example: 1652394005,
  })
  @IsOptional()
  @Min(0)
  @IsInt()
  start?: number;

  @ApiProperty({
    description: 'End of requested time period',
    example: 1654633109,
  })
  @IsOptional()
  @Min(0)
  @IsInt()
  end?: number;
}
