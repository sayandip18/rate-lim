import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { RateLimiterService } from './rate-limit.service';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(private readonly rateLimiter: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const forwarded = request.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ??
      request.socket.remoteAddress;

    if (!ip) {
      throw new HttpException(
        'Unable to identify client',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = (request.body as { user_id?: string })?.user_id;
    const rateLimitKey = userId ?? ip;

    const allowed = await this.rateLimiter.isAllowed(rateLimitKey);

    console.log(
      `[GUARD] key=${rateLimitKey} allowed=${allowed} → about to ${allowed ? 'PASS' : 'BLOCK'}`,
    );

    if (!allowed) {
      throw new HttpException(
        'Rate limit exceeded (Redis)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    console.log(
      `[GUARD] key=${rateLimitKey} → PASSED GUARD, calling microservice`,
    );

    return true;
  }
}
