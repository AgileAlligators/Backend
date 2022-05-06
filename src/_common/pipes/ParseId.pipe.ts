import { Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { MongoIdTypes } from 'src/_common/decorators/MongoId.decorator';
import { ItemNotFoundException } from 'src/_common/exceptions/ItemNotFound.exception';

@Injectable()
export class ParseIdPipe implements PipeTransform<string> {
  constructor(private readonly type: MongoIdTypes) {}

  async transform(value: string): Promise<string> {
    if (!isMongoId(value)) {
      throw new ItemNotFoundException(this.type, value);
    }
    return value;
  }
}
