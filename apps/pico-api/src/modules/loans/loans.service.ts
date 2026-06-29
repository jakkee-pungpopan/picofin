import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toTHB } from '../../common/utils/money';
import { buildSchedule, scheduleTotals, checkCompliance } from '../../common/utils/pico';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}
  private contractNo() { return 'PICO' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(); }

  async reject(appId: string, reason: string) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: appId } });
    if (!app || app.status !== 'PENDING') throw new BadRequestException('คำขอไม่อยู่ในสถานะรออนุมัติ');
    return this.prisma.loanApplication.update({ where: { id: appId }, data: { status: 'REJECTED', decisionNote: reason } });
  }

  // Approve -> compliance re-check -> create loan + amortization schedule + decrement operator capital. Atomic.
  async approve(appId: string, note?: string) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: appId }, include: { borrower: true } });
    if (!app) throw new NotFoundException('ไม่พบคำขอ');
    if (app.status !== 'PENDING') throw new BadRequestException('คำขอนี้ถูกดำเนินการแล้ว');
    const op = await this.prisma.operator.findFirst();
    if (!op) throw new BadRequestException('ยังไม่ได้ตั้งค่าผู้ประกอบการ');

    const principalTHB = toTHB(app.amount);
    const compliance = checkCompliance({
      picoType: op.picoType, principalTHB, annualRatePct: app.annualRatePct,
      borrowerProvince: app.borrower.province, operatorProvince: op.province, termMonths: app.termMonths,
    });
    if (!compliance.ok) throw new BadRequestException('ผิดเงื่อนไขพิโก: ' + compliance.violations.join(' | '));
    if (op.registeredCapital < app.amount) throw new BadRequestException('ทุนของผู้ประกอบการไม่พอปล่อยกู้');

    const schedule = buildSchedule(Number(app.amount), app.annualRatePct, app.termMonths);
    const start = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.operator.update({ where: { id: op.id }, data: { registeredCapital: { decrement: app.amount } } });
      await tx.loanApplication.update({ where: { id: app.id }, data: { status: 'APPROVED', decisionNote: note } });
      const loan = await tx.loan.create({
        data: {
          contractNo: this.contractNo(), applicationId: app.id, borrowerId: app.borrowerId,
          principal: app.amount, annualRatePct: app.annualRatePct, termMonths: app.termMonths,
          installments: { create: schedule.map((s) => {
            const due = new Date(start); due.setMonth(due.getMonth() + s.dueOffsetMonths);
            return { no: s.no, dueDate: due, principal: BigInt(s.principal), interest: BigInt(s.interest), total: BigInt(s.total) };
          }) },
        },
        include: { installments: true },
      });
      return loan;
    });
  }

  private serialize(loan: any) {
    const insts = (loan.installments || []).map((i: any) => ({
      no: i.no, dueDate: i.dueDate, principal: toTHB(i.principal), interest: toTHB(i.interest),
      total: toTHB(i.total), paidAmount: toTHB(i.paidAmount), status: i.status, paidAt: i.paidAt,
    }));
    const totals = loan.installments ? scheduleTotals(loan.installments.map((i: any) => ({ principal: Number(i.principal), interest: Number(i.interest) }))) : null;
    return { ...loan, principal: toTHB(loan.principal), installments: insts,
      summary: totals ? { principal: toTHB(totals.principal), interest: toTHB(totals.interest), total: toTHB(totals.total) } : undefined };
  }

  async list() {
    const loans = await this.prisma.loan.findMany({ orderBy: { disbursedAt: 'desc' }, take: 200, include: { borrower: true, installments: true } });
    return loans.map((l) => this.serialize(l));
  }
  async get(id: string) {
    const l = await this.prisma.loan.findUnique({ where: { id }, include: { borrower: true, installments: { orderBy: { no: 'asc' } }, payments: true } });
    if (!l) throw new NotFoundException('ไม่พบสัญญากู้'); return this.serialize(l);
  }
  async mine(userId: string) {
    const b = await this.prisma.borrower.findUnique({ where: { userId } });
    if (!b) return [];
    const loans = await this.prisma.loan.findMany({ where: { borrowerId: b.id }, include: { installments: { orderBy: { no: 'asc' } } } });
    return loans.map((l) => this.serialize(l));
  }
}
