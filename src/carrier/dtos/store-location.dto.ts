import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class StoreLocationDto {
  @IsOptional()
  @Min(0)
  @IsInt()
  timestamp?: number;

  @Max(180)
  @Min(-180)
  @IsInt()
  longitude: number;

  @Max(90)
  @Min(-90)
  @IsInt()
  latitude: number;
}
