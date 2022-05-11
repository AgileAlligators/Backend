import { Param } from '@nestjs/common';
import { ParseIdPipe } from '../pipes/ParseId.pipe';

enum MongoIdTypes {
  CARRIER = 'Ein Ladungsträger',
  ACCOUNT = 'Ein Account',
  DIAGRAM = 'Ein Diagramm',
}

const MongoId = (type: MongoIdTypes, param = 'id') =>
  Param(param, new ParseIdPipe(type));

export { MongoId, MongoIdTypes };
