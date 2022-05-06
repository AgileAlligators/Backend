import { IsInt, IsOptional, Min } from 'class-validator';

export class StoreLoadDto {
  @IsOptional()
  @Min(0)
  @IsInt()
  timestamp?: number;

  @IsInt()
  load: number;
}
