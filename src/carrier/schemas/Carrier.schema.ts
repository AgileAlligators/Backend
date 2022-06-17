import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ApiCarrierCustomer,
  ApiCarrierOrder,
  ApiCarrierType,
} from '../carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Carrier) => {
      delete ret._id;
      delete ret.__v;
      delete ret._organisation;
      return ret;
    },
  },
})
export class Carrier extends Document {
  @Prop({ required: true })
  _organisation: string;

  @ApiCarrierType({ required: true })
  @Prop({ required: true })
  type: string;

  @ApiCarrierCustomer({ required: true })
  @Prop({ required: true })
  customer: string;

  @ApiCarrierOrder({ required: true })
  @Prop({ required: true })
  order: string;
}

const CarrierSchema = SchemaFactory.createForClass(Carrier);

export const CarrierDefinition: ModelDefinition = {
  name: Carrier.name,
  schema: CarrierSchema,
};
