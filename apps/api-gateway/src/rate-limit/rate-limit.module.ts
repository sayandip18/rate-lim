import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterService } from './rate-limit.service';
import { RateLimiterGuard } from './rate-limit.guard';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST', 'redis'),
          port: config.get<number>('REDIS_PORT', 6379),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: RateLimiterService,
      useFactory: (redis: Redis) => {
        return new RateLimiterService(redis);
      },
      inject: ['REDIS_CLIENT'],
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}
