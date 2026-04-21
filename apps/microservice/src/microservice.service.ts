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

  async getStats(
    userId: string,
  ): Promise<{ firstSeen: Date | null; lastSeen: Date | null }> {
    const result = await this.requestRepo
      .createQueryBuilder('r')
      .select('MIN(r.createdAt)', 'firstSeen')
      .addSelect('MAX(r.createdAt)', 'lastSeen')
      .where('r.userId = :userId', { userId })
      .getRawOne<{ firstSeen: Date | null; lastSeen: Date | null }>();

    return {
      firstSeen: result?.firstSeen ?? null,
      lastSeen: result?.lastSeen ?? null,
    };
  }
}
