import { IsString, MinLength } from 'class-validator';
import { ApiAccountPassword } from '../account.api';

export class ResetPasswordDto {
  @ApiAccountPassword({ minLength: 6, description: 'Das neue Passwort' })
  @MinLength(6, {
    message: 'Das neue Passwort muss mindestens 6 Zeichen haben',
  })
  @IsString({ message: 'Das neue Passwort muss ein String sein' })
  newPassword: string;
}
