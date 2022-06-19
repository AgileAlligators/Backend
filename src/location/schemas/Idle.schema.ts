import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { ApiCarrierId, ApiCarrierTimestamp } from 'src/carrier/carrier.api';
import { GeoJSON } from 'src/carrier/models/GeoJson.model';
import { ApiLocation } from '../location.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Idle) => {
      delete ret._id;
      delete ret.__v;

      if (ret.location) (ret as any).coordinates = ret.location.coordinates;
      delete ret.location;

      return ret;
    },
  },
})
export class Idle extends Document {
  @ApiCarrierId({ required: true })
  @Prop({ required: true })
  carrierId: string;

  @ApiCarrierTimestamp({ required: true })
  @Prop({ default: () => Date.now() })
  timestamp: number;

  @ApiLocation({ required: false })
  @Prop({ required: false })
  location?: GeoJSON;

  @ApiProperty({
    required: true,
    type: Number,
    description:
      'Wie lange stand der Ladungsträger am angegeben Zeitpunkt bereits reglos da (in Sekunden)',
    example: 6000,
    minimum: 0,
  })
  @Prop({ required: true })
  idle: number;
}

const IdleSchema = SchemaFactory.createForClass(Idle);

export const IdleDefinition: ModelDefinition = {
  name: Idle.name,
  schema: IdleSchema,
};
