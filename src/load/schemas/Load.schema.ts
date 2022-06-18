import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { GeoJSON } from 'src/carrier/models/GeoJson.model';
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

      (ret as any).coordinates = ret.location.coordinates;
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

  @ApiCarrierLoad({ required: true })
  @Prop({ required: true })
  load: number;
}

const LoadSchema = SchemaFactory.createForClass(Load);

export const LoadDefinition: ModelDefinition = {
  name: Load.name,
  schema: LoadSchema,
};
