import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Location } from 'src/location/schemas/Location.schema';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Idle) => {
      delete ret._id;
      delete ret.__v;

      return ret;
    },
  },
})
export class Idle extends Location {
  @ApiProperty({
    required: true,
    type: Number,
    description:
      'Wie lange stand der Ladungsträger am angegeben Zeitpunkt bereits reglos da (in Sekunden)',
    example: 6000,
    minimum: 0,
  })
  @Prop({ required: true })
  idle: number;
}

const IdleSchema = SchemaFactory.createForClass(Idle);

export const IdleDefinition: ModelDefinition = {
  name: Idle.name,
  schema: IdleSchema,
};
