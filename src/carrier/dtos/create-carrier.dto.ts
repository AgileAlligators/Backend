import { PartialType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCarrierDto {
  @MinLength(1)
  @IsString()
  type: string;

  @MinLength(1)
  @IsString()
  customer: string;

  @MinLength(1)
  @IsString()
  order: string;
}

export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {}
