import { Controller } from '@nestjs/common';
import { MicroserviceService } from './microservice.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MicroserviceController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  @MessagePattern('health')
  health() {
    console.log('[Microservice] Health pattern hit');
    return { service: 'microservice', status: 'ok' };
  }

  @MessagePattern('handle_request')
  handleRequest(@Payload() data: { user_id?: string | null }) {
    return this.microserviceService.handleRequest(data?.user_id ?? null);
  }
}
