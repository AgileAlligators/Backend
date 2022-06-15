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

export const InvalidHotspotRequest = (hotspotRequest: string) =>
  new BadRequestException(MongoIdTypes.HOTSPOT, hotspotRequest);

export const InvalidLoad = (loadId: string) =>
  new ItemNotFoundException(MongoIdTypes.LOAD, loadId);

export const InvalidLocation = (locationId: string) =>
  new ItemNotFoundException(MongoIdTypes.LOCATION, locationId);

export const InvalidVibration = (vibrationId: string) =>
  new ItemNotFoundException(MongoIdTypes.VIBRATION, vibrationId);
