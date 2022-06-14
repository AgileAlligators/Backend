import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import {
  ApiCarrierComponent,
  ApiCarrierCustomer,
  ApiCarrierOrder,
  ApiCarrierType,
} from '../carrier.api';

export class CreateCarrierDto {
  @ApiCarrierComponent({ minLength: 1, required: false })
  @IsOptional()
  @MinLength(1, { message: 'Das Bauteil muss mindestens 1 Zeichen lang sein' })
  @IsString({ message: 'Das Bauteil muss ein String sein' })
  component?: string;

  @ApiCarrierType({ minLength: 1 })
  @MinLength(1, {
    message: 'Der Typ des Ladungsträgers muss mindestens 1 Zeichen lang sein',
  })
  @IsString({ message: 'Der Typ des Ladungsträgers muss ein String sein' })
  type: string;

  @ApiCarrierCustomer({ minLength: 1 })
  @MinLength(1, {
    message: 'Der Name des Kunden muss mindestens 1 Zeichen lang sein',
  })
  @IsString({ message: 'Der Kunde muss ein String sein' })
  customer: string;

  @ApiCarrierOrder({ minLength: 1 })
  @MinLength(1, { message: 'Die Order ID muss mindestens 1 Zeichen lang sein' })
  @IsString({ message: 'Die Order ID muss ein String sein' })
  order: string;
}

export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {}
