import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeoJSON } from 'src/carrier/models/GeoJson.model';
import { ApiLocation } from 'src/location/location.api';
import {
  ApiCarrierId,
  ApiCarrierLoad,
  ApiCarrierTimestamp,
} from '../../carrier/carrier.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Load) => {
      delete ret._id;
      delete ret.__v;

      if (ret.location) (ret as any).coordinates = ret.location.coordinates;
      delete ret.location;

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
  timestamp?: number;

  @ApiLocation({ required: false })
  @Prop({ required: false })
  location?: GeoJSON;

  @ApiCarrierLoad({ required: true })
  @Prop({ required: true })
  load: number;
}

const LoadSchema = SchemaFactory.createForClass(Load);

export const LoadDefinition: ModelDefinition = {
  name: Load.name,
  schema: LoadSchema,
};
