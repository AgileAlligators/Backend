import { IsString, Matches, MinLength } from 'class-validator';
import { ApiAccountPassword, ApiAccountUsername } from '../account.api';

export class CreateAccountDto {
  @ApiAccountUsername({ minLength: 4 })
  @Matches(new RegExp('((?!TU_).)*', 'i'), {
    message: 'Der Username darf nicht mit TU_ anfangen',
  })
  @MinLength(4, { message: 'Der Username muss mindestens 4 Zeichen lang sein' })
  @IsString({ message: 'Der Nutzername muss ein String sein' })
  username: string;

  @ApiAccountPassword({ minLength: 6 })
  @MinLength(6, { message: 'Das Passwort muss mindestens 6 Zeichen haben' })
  @IsString({ message: 'Das Passwort muss ein String sein' })
  password: string;
}
