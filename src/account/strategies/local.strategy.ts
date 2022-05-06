import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AccountService } from '../account.service';
import { AAccount } from '../decorators/account.decorator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly accountService: AccountService) {
    super();
  }

  async validate(username: string, password: string): Promise<AAccount> {
    const account = await this.accountService.validate(
      username.toString(),
      password.toString(),
    );
    if (account) return account;

    throw new UnauthorizedException(
      'Username und Passwort stimmen nicht überein',
    );
  }
}
