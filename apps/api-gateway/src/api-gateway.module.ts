import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { RateLimiterModule } from './rate-limit/rate-limit.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RateLimiterModule,
    ClientsModule.registerAsync([
      {
        name: 'MICROSERVICE_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('MICROSERVICE_HOST', 'microservice'),
            port: config.get<number>('MICROSERVICE_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
