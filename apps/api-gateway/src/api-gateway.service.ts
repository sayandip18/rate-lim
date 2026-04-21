import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RateLimiterService } from './rate-limit/rate-limit.service';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject('MICROSERVICE_CLIENT') private readonly client: ClientProxy,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  handleRequest(userId?: string) {
    return firstValueFrom(
      this.client.send('handle_request', { user_id: userId ?? null }),
    );
  }

  async getStats(userId: string) {
    const [redisStats, pgStats] = await Promise.all([
      this.rateLimiter.getStats(userId),
      firstValueFrom(
        this.client.send<{ firstSeen: Date | null; lastSeen: Date | null }>(
          'get_stats',
          { user_id: userId },
        ),
      ),
    ]);

    return {
      user_id: userId,
      bucket_active: redisStats.bucketActive,
      tokens_remaining: redisStats.tokensRemaining,
      next_token_in_ms: redisStats.nextTokenInMs,
      first_seen: pgStats.firstSeen,
      last_seen: pgStats.lastSeen,
    };
  }
}
