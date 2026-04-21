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
}
