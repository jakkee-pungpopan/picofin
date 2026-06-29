import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toTHB } from '../../common/utils/money';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}
  private serialize = (a: any) => ({ ...a, balance: toTHB(a.balance), balanceSatang: a.balance.toString() });

  async list(userId: string) {
    const accts = await this.prisma.account.findMany({ where: { userId }, orderBy: { isPrimary: 'desc' } });
    return accts.map(this.serialize);
  }
  async get(userId: string, id: string) {
    const a = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!a) throw new NotFoundException('Account not found');
    return this.serialize(a);
  }
}
