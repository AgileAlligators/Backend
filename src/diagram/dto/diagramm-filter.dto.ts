import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class DiagramFilterDto {
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsNumber()
  start?: string[];

  @IsOptional()
  @IsNumber()
  end?: string[];
}
