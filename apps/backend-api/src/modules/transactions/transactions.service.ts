import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toTHB } from '../../common/utils/money';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  async list(userId: string, accountId?: string, limit = 50) {
    const accts = await this.prisma.account.findMany({ where: { userId }, select: { id: true } });
    const ids = accts.map((a) => a.id);
    const where: any = accountId
      ? { OR: [{ fromAccountId: accountId }, { toAccountId: accountId }] }
      : { OR: [{ fromAccountId: { in: ids } }, { toAccountId: { in: ids } }] };
    const txns = await this.prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' }, take: Math.min(limit, 100) });
    return txns.map((t) => ({
      ...t, amount: toTHB(t.amount), fee: toTHB(t.fee),
      balanceAfter: t.balanceAfter != null ? toTHB(t.balanceAfter) : null,
      direction: ids.includes(t.fromAccountId ?? '') ? 'DEBIT' : 'CREDIT',
    }));
  }
}
