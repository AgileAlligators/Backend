import {
  IsDefined,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SkipLimitDto } from 'src/_common/skip-limit/SkipLimit.dto';

export class CarrierFilterDto extends SkipLimitDto {
  @IsOptional()
  @IsMongoId({ each: true })
  ids?: string[];

  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  types?: string[];

  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  customers?: string[];

  @IsOptional()
  @MinLength(1, { each: true })
  @IsDefined({ each: true })
  @IsString({ each: true })
  orders?: string[];
}
