import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MongoIdTypes } from 'src/_common/decorators/MongoId.decorator';
import { ParseIdPipe } from 'src/_common/pipes/ParseId.pipe';

const RAccount = createParamDecorator(
  (data: string, ctx: ExecutionContext): AAccount => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!data) return user;
    return user && user[data] ? user[data] : user;
  },
);

const ROrganisation = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const user = ctx.switchToHttp().getRequest().user;
    return user ? user.organisation : '';
  },
);

const RId = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const user = ctx.switchToHttp().getRequest().user;
    return user ? user.id : '';
  },
);

const RawId = createParamDecorator((_, ctx: ExecutionContext): string => {
  const user = ctx.switchToHttp().getRequest().user;
  return user ? user.id : '';
});

const AccountId = () => RawId(new ParseIdPipe(MongoIdTypes.ACCOUNT));

interface AAccount {
  id: string;
  username: string;
  permissions: string[];
  group: string;
  organisation: string;
}

export { RAccount, ROrganisation, RId, AAccount, AccountId };
