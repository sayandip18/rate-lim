import { NestFactory } from '@nestjs/core';
import { MicroserviceModule } from './microservice.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(MicroserviceModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3001 },
  });
  await app.listen();
  console.log('Microservice listening on port 3001');
}
bootstrap();
