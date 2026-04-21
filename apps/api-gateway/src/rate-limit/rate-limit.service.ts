import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RateLimiterService implements OnModuleInit {
  private luaScript: string;

  constructor(private readonly redis: Redis) {}

  onModuleInit() {
    const filePath = path.join(__dirname, 'scripts', 'token-bucket-script.lua');
    this.luaScript = fs.readFileSync(filePath, 'utf8');
  }

  async isAllowed(userId: string): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    const now = Date.now();

    const [allowed, remaining] = (await this.redis.eval(
      this.luaScript,
      1,
      key,
      5,
      12000,
      now,
    )) as [number, number];

    console.log(
      `[${userId}] allowed=${allowed}, remaining=${remaining}, now=${now}`,
    );

    return allowed === 1;
  }

  async getStats(userId: string): Promise<{
    bucketActive: boolean;
    tokensRemaining: number | null;
    nextTokenInMs: number | null;
  }> {
    const key = `rate_limit:${userId}`;
    const capacity = 5;
    const refillRateMs = 12000;
    const now = Date.now();

    const [rawTokens, rawLastRefill] = await this.redis.hmget(
      key,
      'tokens',
      'last_refill',
    );

    if (rawTokens === null || rawLastRefill === null) {
      return {
        bucketActive: false,
        tokensRemaining: null,
        nextTokenInMs: null,
      };
    }

    const tokens = parseInt(rawTokens, 10);
    const lastRefill = parseInt(rawLastRefill, 10);

    const elapsed = now - lastRefill;
    const tokensToAdd = Math.floor(elapsed / refillRateMs);
    const effectiveTokens = Math.min(capacity, tokens + tokensToAdd);
    const effectiveLastRefill = lastRefill + tokensToAdd * refillRateMs;

    const nextTokenInMs =
      effectiveTokens >= capacity
        ? null
        : Math.max(0, effectiveLastRefill + refillRateMs - now);

    return {
      bucketActive: true,
      tokensRemaining: effectiveTokens,
      nextTokenInMs,
    };
  }
}
