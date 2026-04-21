import { Controller } from '@nestjs/common';
import { MicroserviceService } from './microservice.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MicroserviceController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  @MessagePattern('health')
  health() {
    console.log('[Microservice] Health pattern hit');
    return { service: 'microservice', status: 'ok' };
  }

  @MessagePattern('handle_request')
  handleRequest() {
    return this.microserviceService.handleRequest();
  }
}
