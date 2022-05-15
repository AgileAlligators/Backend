import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { ApiCarrierId, ApiCarrierTimestamp } from '../carrier.api';
import { GeoJSON } from '../models/GeoJson.model';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Location) => {
      delete ret._id;
      delete ret.__v;

      (ret as any).coordinates = ret.location.coordinates;
      delete ret.location;

      return ret;
    },
  },
})
export class Location extends Document {
  @ApiCarrierId({ required: true })
  @Prop({ required: true })
  carrierId: string;

  @ApiCarrierTimestamp({ required: true })
  @Prop({ default: () => Date.now() })
  timestamp: number;

  @ApiProperty({
    type: [Number, Number],
    name: 'coordinates',
    description:
      'Koordinaten (longitude [-180 bis 180], latitude [-90 bis 90])',
    example: [0, 0],
    required: true,
  })
  @Prop({ required: true })
  location: GeoJSON;
}

const LocationSchema = SchemaFactory.createForClass(Location);

export const LocationDefinition: ModelDefinition = {
  name: Location.name,
  schema: LocationSchema,
};
