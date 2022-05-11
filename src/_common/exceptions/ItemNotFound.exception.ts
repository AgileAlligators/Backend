import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { MongoIdTypes } from 'src/_common/decorators/MongoId.decorator';

@Injectable()
export class ItemNotFoundException extends HttpException {
  constructor(
    type: MongoIdTypes | string,
    value: string,
    code = HttpStatus.NOT_FOUND,
  ) {
    super(`${type} mit der ID ${value} existiert nicht`, code);
  }
}

export const InvalidAccount = (accountId: string) =>
  new ItemNotFoundException(MongoIdTypes.ACCOUNT, accountId);

export const InvalidCarrier = (carrierId: string) =>
  new ItemNotFoundException(MongoIdTypes.CARRIER, carrierId);

export const InvalidDiagrammRequest = (diagrammRequest: string) =>
  new BadRequestException(MongoIdTypes.DIAGRAM, diagrammRequest);
