import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toSatang, toTHB } from '../../common/utils/money';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // Record a repayment and allocate to the oldest unpaid installments. Atomic.
  async pay(loanId: string, amountTHB: number, method = 'CASH', note?: string) {
    if (!(amountTHB > 0)) throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId }, include: { installments: { orderBy: { no: 'asc' } } } });
    if (!loan) throw new NotFoundException('ไม่พบสัญญากู้');
    if (loan.status === 'CLOSED') throw new BadRequestException('สัญญานี้ปิดแล้ว');

    let remaining = toSatang(amountTHB);
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({ data: { loanId, amount: toSatang(amountTHB), method, note } });
      for (const inst of loan.installments) {
        if (remaining <= BigInt(0)) break;
        if (inst.status === 'PAID') continue;
        const owed = inst.total - inst.paidAmount;
        const applied = remaining >= owed ? owed : remaining;
        const newPaid = inst.paidAmount + applied;
        await tx.installment.update({
          where: { id: inst.id },
          data: { paidAmount: newPaid, status: newPaid >= inst.total ? 'PAID' : 'PARTIAL', paidAt: newPaid >= inst.total ? new Date() : null },
        });
        remaining -= applied;
      }
      const left = await tx.installment.count({ where: { loanId, status: { not: 'PAID' } } });
      if (left === 0) await tx.loan.update({ where: { id: loanId }, data: { status: 'CLOSED' } });
      return { success: true, loanId, applied: amountTHB, change: toTHB(remaining > BigInt(0) ? remaining : BigInt(0)), loanClosed: left === 0 };
    });
  }

  list(loanId: string) { return this.prisma.payment.findMany({ where: { loanId }, orderBy: { createdAt: 'desc' } }); }
}
