import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}
  async log(params: {
    actorType: 'USER' | 'ADMIN' | 'SYSTEM';
    actorId?: string; action: string; entity?: string; entityId?: string;
    metadata?: any; ip?: string;
  }) {
    await this.prisma.auditLog.create({ data: { ...params } });
  }
}
