import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ApiCarrierId,
  ApiCarrierLoad,
  ApiCarrierTimestamp,
} from '../carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Load) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Load extends Document {
  @ApiCarrierId({ required: true })
  @Prop({ required: true })
  carrierId: string;

  @ApiCarrierTimestamp({ required: true })
  @Prop({ default: () => Date.now() })
  timestamp: number;

  @ApiCarrierLoad({ required: true })
  @Prop({ required: true })
  load: number;
}

const LoadSchema = SchemaFactory.createForClass(Load);

export const LoadDefinition: ModelDefinition = {
  name: Load.name,
  schema: LoadSchema,
};
