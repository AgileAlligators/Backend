import { IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class DiagramFilterDto {
  @IsMongoId()
  id: string;

  @IsString()
  dataRequest: string;

  @IsOptional()
  @IsInt()
  start?: number;

  @IsOptional()
  @IsInt()
  end?: number;
}
