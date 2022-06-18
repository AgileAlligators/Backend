import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Location } from 'src/location/schemas/Location.schema';
import { ApiCarrierVibration } from '../../carrier/carrier.api';

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
export class Vibration extends Location {
  @ApiCarrierVibration({ required: true })
  @Prop({ required: true })
  vibration: number;
}

const VibrationSchema = SchemaFactory.createForClass(Vibration);

export const VibrationDefinition: ModelDefinition = {
  name: Vibration.name,
  schema: VibrationSchema,
};
