import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTransferDto } from './dto/transfer.dto';
import { toSatang, toTHB } from '../../common/utils/money';

const MAX_TRANSFER_THB = 200_000; // demo limit

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private ref() {
    return 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  async create(userId: string, dto: CreateTransferDto, ip?: string) {
    // ---- validate amount ----
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) throw new BadRequestException('Invalid amount');
    if (dto.amount > MAX_TRANSFER_THB) throw new BadRequestException(`Amount exceeds demo limit (${MAX_TRANSFER_THB} THB)`);
    const amount = toSatang(dto.amount);

    const source = await this.prisma.account.findFirst({ where: { id: dto.fromAccountId, userId } });
    if (!source) throw new NotFoundException('Source account not found');
    if (source.accountNumber === dto.toAccountNumber) throw new BadRequestException('Cannot transfer to the same account');
    if (source.balance < amount) throw new BadRequestException('Insufficient balance');

    // destination may be an internal account (same bank mock) or external mock
    const dest = await this.prisma.account.findUnique({ where: { accountNumber: dto.toAccountNumber } });

    // ---- atomic transaction ----
    const result = await this.prisma.$transaction(async (tx) => {
      const debited = await tx.account.update({
        where: { id: source.id }, data: { balance: { decrement: amount } },
      });
      let creditedBalance: bigint | null = null;
      if (dest) {
        const credited = await tx.account.update({
          where: { id: dest.id }, data: { balance: { increment: amount } },
        });
        creditedBalance = credited.balance;
        await tx.transaction.create({
          data: { reference: this.ref(), type: 'TRANSFER_IN', amount, description: dto.note ?? 'Transfer received',
            toAccountId: dest.id, counterparty: source.accountNumber, balanceAfter: creditedBalance },
        });
      }
      const outTxn = await tx.transaction.create({
        data: { reference: this.ref(), type: 'TRANSFER_OUT', amount,
          description: dto.note ?? `Transfer via ${dto.channel}`,
          fromAccountId: source.id, counterparty: dto.toAccountNumber, balanceAfter: debited.balance },
      });
      return { outTxn, balanceAfter: debited.balance };
    });

    await this.audit.log({
      actorType: 'USER', actorId: userId, action: 'TRANSFER', entity: 'Transaction', entityId: result.outTxn.id,
      metadata: { amount: dto.amount, channel: dto.channel, to: dto.toAccountNumber }, ip,
    });

    // notification (mock receipt)
    await this.prisma.notification.create({
      data: { userId, title: 'Transfer successful', body: `You transferred THB ${dto.amount.toLocaleString()} to ${dto.toAccountNumber}`, type: 'TRANSACTION' },
    });

    return {
      success: true,
      reference: result.outTxn.reference,
      amount: dto.amount,
      to: dto.toAccountNumber,
      channel: dto.channel,
      balanceAfter: toTHB(result.balanceAfter),
      timestamp: result.outTxn.createdAt,
      notice: 'This is a demo banking system. Do not use for real financial transactions.',
    };
  }
}
