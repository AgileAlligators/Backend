import { Injectable } from '@nestjs/common';
import { MongoIdTypes } from 'src/_common/decorators/MongoId.decorator';
import { ItemNotFoundException } from './ItemNotFound.exception';

@Injectable()
export class InvalidAccountException extends ItemNotFoundException {
  constructor(accountId: string) {
    super(MongoIdTypes.ACCOUNT, accountId);
  }
}
