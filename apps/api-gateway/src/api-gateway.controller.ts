import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('health')
  health() {
    console.log('[API Gateway] Health check hit');
    return { service: 'api-gateway', status: 'ok' };
  }
}
