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

  async handleRequest(
    userId: string | null,
  ): Promise<{ id: number; userId: string | null; createdAt: Date }> {
    const entity = this.requestRepo.create({ userId });
    const saved = await this.requestRepo.save(entity);
    return { id: saved.id, userId: saved.userId, createdAt: saved.createdAt };
  }
}
