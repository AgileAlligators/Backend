import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ApiAccountGroup,
  ApiAccountOrganisation,
  ApiAccountPermissions,
  ApiAccountUsername,
} from '../account.api';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, ret: Account) => {
      delete ret._id;
      delete ret.__v;
      delete ret._createdBy;

      delete ret.password;
      return ret;
    },
  },
})
export class Account extends Document {
  @ApiAccountUsername()
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @ApiAccountPermissions()
  @Prop({ required: true })
  permissions: string[];

  @ApiAccountGroup()
  @Prop({ required: true })
  group: string;

  @ApiAccountOrganisation()
  @Prop({ required: true })
  organisation: string;

  @Prop({ required: true })
  _createdBy: string;
}

const AccountSchema = SchemaFactory.createForClass(Account);

export const AccountDefinition: ModelDefinition = {
  name: Account.name,
  schema: AccountSchema,
};
