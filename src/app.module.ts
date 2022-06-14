import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { CarrierModule } from './carrier/carrier.module';
import { AccountModule } from './account/account.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { DiagramModule } from './diagram/diagram.module';
import { HotspotModule } from './hotspot/hotspot.module';
import { DataGenerationModule } from './data-generation/data-generation.module';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_NODE'),
        };
      },
    }),
    CarrierModule,
    AccountModule,
    AnalyzerModule,
    DiagramModule,
    HotspotModule,
    DataGenerationModule
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class AppModule {}
