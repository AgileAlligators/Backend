import { IsIn, IsString } from 'class-validator';
import { ApiAccountGroup } from '../account.api';

export class SetGroupDto {
  @ApiAccountGroup()
  @IsIn(['admin', 'default'], {
    message: 'Ungültge gruppe. Valide: admin, default',
  })
  @IsString({ message: 'Die Gruppe muss als String angegeben werden' })
  group: string;
}
