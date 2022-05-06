import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeoJSON } from '../models/GeoJson.model';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Location) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Location extends Document {
  @Prop()
  carrierId: string;

  @Prop()
  timestamp: number;

  @Prop()
  location: GeoJSON;
}

const LocationSchema = SchemaFactory.createForClass(Location);

export const LocationDefinition: ModelDefinition = {
  name: Location.name,
  schema: LocationSchema,
};
