import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierModule } from 'src/carrier/carrier.module';
import { LocationModule } from 'src/location/location.module';
import { LoadController } from './load.controller';
import { LoadService } from './load.service';
import { LoadDefinition } from './schemas/Load.schema';
import { LoadOverTimeDefinition } from './schemas/LoadOverTime.schema';

@Module({
  providers: [LoadService],
  controllers: [LoadController],
  imports: [
    CarrierModule,
    MongooseModule.forFeature([LoadDefinition, LoadOverTimeDefinition]),
    forwardRef(() => LocationModule),
  ],
  exports: [LoadService],
})
export class LoadModule {}
