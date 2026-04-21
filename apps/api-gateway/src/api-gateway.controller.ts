import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { RateLimiterGuard } from './rate-limit/rate-limit.guard';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('health')
  health() {
    console.log('[API Gateway] Health check hit');
    return { service: 'api-gateway', status: 'ok' };
  }

  @UseGuards(RateLimiterGuard)
  @Post('request')
  handleRequest(@Body() body: { user_id?: string }) {
    return this.apiGatewayService.handleRequest(body.user_id);
  }
}
