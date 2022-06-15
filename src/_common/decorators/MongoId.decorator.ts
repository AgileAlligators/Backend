import { Param } from '@nestjs/common';
import { ParseIdPipe } from '../pipes/ParseId.pipe';

enum MongoIdTypes {
  CARRIER = 'Ein Ladungsträger',
  ACCOUNT = 'Ein Account',
  DIAGRAM = 'Ein Diagramm',
  HOTSPOT = 'Ein Hotspot',
  LOCATION = 'Ein Standort',
  LOAD = 'Eine Beladungsinformation',
  VIBRATION = 'Eine Erschütterung',
}

const MongoId = (type: MongoIdTypes, param = 'id') =>
  Param(param, new ParseIdPipe(type));

export { MongoId, MongoIdTypes };
