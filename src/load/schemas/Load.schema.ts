import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Location } from 'src/location/schemas/Location.schema';
import { ApiCarrierLoad } from '../../carrier/carrier.api';

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
export class Load extends Location {
  @ApiCarrierLoad({ required: true })
  @Prop({ required: true })
  load: number;
}

const LoadSchema = SchemaFactory.createForClass(Load);

export const LoadDefinition: ModelDefinition = {
  name: Load.name,
  schema: LoadSchema,
};
