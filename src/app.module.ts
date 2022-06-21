import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AccountModule } from './account/account.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { CarrierModule } from './carrier/carrier.module';
import { DataGenerationModule } from './data-generation/data-generation.module';
import { LoadModule } from './load/load.module';
import { LocationModule } from './location/location.module';
import { StreamModule } from './stream/stream.module';
import { VibrationModule } from './vibration/vibration.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'documentation'),
      exclude: ['/api*'],
      serveRoot: '/docs',
    }),
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
    DataGenerationModule,
    StreamModule,
    LoadModule,
    LocationModule,
    VibrationModule,
    HealthModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class AppModule {}
