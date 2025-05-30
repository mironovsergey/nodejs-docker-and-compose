import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          return {
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '60m' },
          };
        } catch (error) {
          throw new Error('Не удалось сконфигурировать JwtModule');
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
