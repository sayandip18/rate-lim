import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './request.entity';

@Injectable()
export class MicroserviceService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepo: Repository<Request>,
  ) {}

  async handleRequest(): Promise<{ id: number; createdAt: Date }> {
    const saved = await this.requestRepo.save(this.requestRepo.create());
    return { id: saved.id, createdAt: saved.createdAt };
  }
}
