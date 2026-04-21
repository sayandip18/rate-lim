import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject('MICROSERVICE_CLIENT') private readonly client: ClientProxy,
  ) {}

  handleRequest() {
    return firstValueFrom(this.client.send('handle_request', {}));
  }
}
