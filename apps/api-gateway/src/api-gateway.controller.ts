import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('health')
  health() {
    console.log('[API Gateway] Health check hit');
    return { service: 'api-gateway', status: 'ok' };
  }

  @Post('request')
  handleRequest(@Body() body: { user_id?: string }) {
    return this.apiGatewayService.handleRequest(body?.user_id);
  }

  @Get('stats/:user_id')
  getStats(@Param('user_id') userId: string) {
    return this.apiGatewayService.getStats(userId);
  }
}
