import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountDefinition } from './schemas/Account.schema';
import { JwtStrategy } from './strategies/jwt.stragey';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
    MongooseModule.forFeature([AccountDefinition]),
  ],
  providers: [AccountService, LocalStrategy, JwtStrategy],
  controllers: [AccountController],
  exports: [JwtModule],
})
export class AccountModule {}
