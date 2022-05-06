import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ChangePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['news.create', 'radar.update'],
    description: 'Die einzelnen Berechtigungen, die gesetzt werden sollen',
  })
  @IsString({
    each: true,
    message: 'Die einzelnen Berechtigungen müssen als String angegeben werden',
  })
  @IsArray({
    message: 'Die einzelnen Permissions müssen als Array angegeben werden',
  })
  permissions: string[];
}
