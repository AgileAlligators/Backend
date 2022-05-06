import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  @Prop()
  _organisation: string;

  @Prop()
  type: string;

  @Prop()
  customer: string;

  @Prop()
  order: string;
}

const CarrierSchema = SchemaFactory.createForClass(Carrier);

export const CarrierDefinition: ModelDefinition = {
  name: Carrier.name,
  schema: CarrierSchema,
};
