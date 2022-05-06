import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  @Prop()
  carrierId: string;

  @Prop()
  timestamp: number;

  @Prop()
  load: number;
}

const LoadSchema = SchemaFactory.createForClass(Load);

export const LoadDefinition: ModelDefinition = {
  name: Load.name,
  schema: LoadSchema,
};
