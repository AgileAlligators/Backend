import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiLocation } from 'src/location/location.api';
import {
  ApiCarrierId,
  ApiCarrierLoad,
  ApiCarrierTimestamp,
} from '../../carrier/carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: LoadOverTime) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class LoadOverTime extends Document {
  @ApiCarrierId({ required: true })
  @Prop({ required: true })
  carrierId: string;

  @ApiCarrierTimestamp({ required: true })
  @Prop({ default: () => Date.now() })
  timestamp: number;

  @ApiLocation({ required: true })
  @Prop({ required: true })
  time: number;

  @ApiCarrierLoad({ required: true })
  @Prop({ required: true })
  load: number;
}

const LoadOverTimeSchema = SchemaFactory.createForClass(LoadOverTime);

export const LoadOverTimeDefinition: ModelDefinition = {
  name: LoadOverTime.name,
  schema: LoadOverTimeSchema,
};
