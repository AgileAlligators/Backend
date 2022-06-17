import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SkipLimitDto } from 'src/_common/skip-limit/SkipLimit.dto';

export class CarrierFilterDto extends SkipLimitDto {
  @ApiProperty({
    type: [String],
    description: 'Ids der Ladungsträger',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ each: true })
  ids?: string[];

  @ApiProperty({
    type: [String],
    description: 'Typen der Ladungsträger',
    required: false,
  })
  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  types?: string[];

  @ApiProperty({
    type: [String],
    description: 'Zugeordnete Kunden der Ladungsträger',
    required: false,
  })
  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  customers?: string[];

  @ApiProperty({
    type: [String],
    description: 'Lieferungen der Ladungsträger',
    required: false,
  })
  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  orders?: string[];
}
