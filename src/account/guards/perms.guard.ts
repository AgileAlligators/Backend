import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { REGISTERED_PERMISSIONS } from '../account.service';
import { AAccount } from '../decorators/account.decorator';
import { JwtAuthGuard } from './jwt.guard';

const meta = 'AgilePerms';

function transformPermissions(permissions: string[]): string[] {
  const mapped = permissions.map((p) => {
    return [p, p.split('.').slice(0, -1).join('.') + '.*'];
  });
  return [...new Set(mapped.flat())];
}

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
}

export function Perms(...perms: string[]) {
  transformPermissions(perms)
    .filter((p) => !p.includes('organisation'))
    .forEach((p) => REGISTERED_PERMISSIONS.add(p));

  return applyDecorators(
    SetMetadata(meta, perms),
    UseGuards(JwtAuthGuard, PermsGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Permissions: ' + perms.join(', ') }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

@Injectable()
export class PermsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let perms = this.reflector.get<string[]>(meta, context.getHandler());
    if (!perms || !perms.length || perms.length === 0) {
      return true;
    }
    perms = transformPermissions(perms);

    const req = context.switchToHttp().getRequest();
    const account: AAccount = req.user;

    if (!(account.permissions || account.group)) {
      throw new UnauthorizedException(
        'Bitte melde dich an, um diesen Endpunkt zu benutzen',
      );
    }

    if (account.group.toLocaleLowerCase() === 'admin') return true;

    const accountPerms = account.permissions.map((x) => x.toLowerCase());
    if (perms.some((p) => accountPerms.includes(p.toLowerCase()))) {
      return true;
    }

    const p = perms.join(', ');
    throw new UnauthorizedException(
      `Du besitzt nicht die benötigte Berechtigung, um diesen Endpunkt zu benutzen. Benötigte Rechte: ${p}`,
    );
  }
}
