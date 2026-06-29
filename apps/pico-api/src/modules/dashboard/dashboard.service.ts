import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toTHB } from '../../common/utils/money';
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}
  async summary() {
    const op = await this.prisma.operator.findFirst();
    const [borrowers, activeLoans, pendingApps, disbursedAgg, outstandingAgg, overdue] = await Promise.all([
      this.prisma.borrower.count(),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loanApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.loan.aggregate({ _sum: { principal: true } }),
      this.prisma.installment.aggregate({ _sum: { total: true, paidAmount: true }, where: { status: { not: 'PAID' } } }),
      this.prisma.installment.count({ where: { status: 'OVERDUE' } }),
    ]);
    const outTotal = Number(outstandingAgg._sum.total ?? 0) - Number(outstandingAgg._sum.paidAmount ?? 0);
    return {
      operator: op ? { name: op.name, picoType: op.picoType, province: op.province, capital: toTHB(op.registeredCapital) } : null,
      borrowers, activeLoans, pendingApplications: pendingApps,
      totalDisbursed: toTHB(disbursedAgg._sum.principal ?? 0),
      outstanding: toTHB(outTotal < 0 ? 0 : outTotal),
      overdueInstallments: overdue,
      notice: 'ระบบตัวอย่าง — ปล่อยกู้จากทุนตัวเอง ไม่รับฝากเงินประชาชน',
    };
  }
}
