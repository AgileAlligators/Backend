import { IsString, MinLength } from 'class-validator';
import { ApiAccountPassword } from '../account.api';

export class UpdatePasswordDto {
  @ApiAccountPassword({ minLength: 6, description: 'Das alte Passwort' })
  @MinLength(6, {
    message: 'Das alte Passwort muss mindestens 6 Zeichen haben',
  })
  @IsString({ message: 'Das alte Passwort muss ein String sein' })
  oldPassword: string;

  @ApiAccountPassword({ minLength: 6, description: 'Das neue Passwort' })
  @MinLength(6, {
    message: 'Das neue Passwort muss mindestens 6 Zeichen haben',
  })
  @IsString({ message: 'Das neue Passwort muss ein String sein' })
  newPassword: string;
}
