import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeoJSON } from 'src/carrier/models/GeoJson.model';
import { ApiLocation } from 'src/location/location.api';
import {
  ApiCarrierId,
  ApiCarrierTimestamp,
  ApiCarrierVibration,
} from '../../carrier/carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Vibration) => {
      delete ret._id;
      delete ret.__v;

      if (ret.location) (ret as any).coordinates = ret.location.coordinates;
      delete ret.location;

      return ret;
    },
  },
})
export class Vibration extends Document {
  @ApiCarrierId({ required: true })
  @Prop({ required: true })
  carrierId: string;

  @ApiCarrierTimestamp({ required: true })
  @Prop({ default: () => Date.now() })
  timestamp?: number;

  @ApiLocation({ required: false })
  @Prop({ required: false })
  location?: GeoJSON;

  @ApiCarrierVibration({ required: true })
  @Prop({ required: true })
  vibration: number;
}

const VibrationSchema = SchemaFactory.createForClass(Vibration);

export const VibrationDefinition: ModelDefinition = {
  name: Vibration.name,
  schema: VibrationSchema,
};
