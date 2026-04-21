import { Module, Global } from '@nestjs/common';
import { RateLimiterService } from './rate-limit.service';
import { RateLimiterGuard } from './rate-limit.guard';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
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
