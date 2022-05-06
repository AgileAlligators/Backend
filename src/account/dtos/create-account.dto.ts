import { IsString, MinLength } from 'class-validator';
import { ApiAccountPassword, ApiAccountUsername } from '../account.api';

export class CreateAccountDto {
  @ApiAccountUsername({ minLength: 4 })
  @MinLength(4, { message: 'Der Username muss mindestens 4 Zeichen lang sein' })
  @IsString({ message: 'Der Nutzername muss ein String sein' })
  username: string;

  @ApiAccountPassword({ minLength: 6 })
  @MinLength(6, { message: 'Das Passwort muss mindestens 6 Zeichen haben' })
  @IsString({ message: 'Das Passwort muss ein String sein' })
  password: string;
}
