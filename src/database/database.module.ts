import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const database = configService.get('database', { infer: true });
        const isProd = configService.get('nodeEnv', { infer: true }) === 'production';

        return {
          type: 'postgres' as const,
          url: database.url,
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: database.synchronize,
          logging: !isProd,
          ssl: database.url ? { rejectUnauthorized: false } : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {}


