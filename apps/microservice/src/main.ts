import { NestFactory } from '@nestjs/core';
import { MicroserviceModule } from './microservice.module';

async function bootstrap() {
  const app = await NestFactory.create(MicroserviceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
