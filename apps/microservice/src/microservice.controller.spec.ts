import { Test, TestingModule } from '@nestjs/testing';
import { MicroserviceController } from './microservice.controller';
import { MicroserviceService } from './microservice.service';

describe('MicroserviceController', () => {
  let microserviceController: MicroserviceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MicroserviceController],
      providers: [MicroserviceService],
    }).compile();

    microserviceController = app.get<MicroserviceController>(MicroserviceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(microserviceController.getHello()).toBe('Hello World!');
    });
  });
});
