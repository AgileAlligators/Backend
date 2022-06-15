import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ApiCarrierId,
  ApiCarrierTimestamp,
  ApiCarrierVibration,
} from '../carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Vibration) => {
      delete ret._id;
      delete ret.__v;
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
  timestamp: number;

  @ApiCarrierVibration({ required: true })
  @Prop({ required: true })
  vibration: number;
}

const VibrationSchema = SchemaFactory.createForClass(Vibration);

export const VibrationDefinition: ModelDefinition = {
  name: Vibration.name,
  schema: VibrationSchema,
};
