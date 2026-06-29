import { LoansService } from '../loans/loans.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/application.dto';
import { toSatang, toTHB } from '../../common/utils/money';
import { checkCompliance } from '../../common/utils/pico';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService, private loans: LoansService) {}

  private async operator() {
    const op = await this.prisma.operator.findFirst();
    if (!op) throw new BadRequestException('ยังไม่ได้ตั้งค่าผู้ประกอบการ (operator)');
    return op;
  }

  // Preview compliance before submitting (no write).
  async preview(borrowerProvince: string, dto: CreateApplicationDto) {
    const op = await this.operator();
    return checkCompliance({
      picoType: op.picoType, principalTHB: dto.amount, annualRatePct: dto.annualRatePct,
      borrowerProvince, operatorProvince: op.province, termMonths: dto.termMonths,
    });
  }

  async create(user: { id: string; role: string }, dto: CreateApplicationDto) {
    let borrowerId = dto.borrowerId;
    if (user.role === 'BORROWER') {
      const b = await this.prisma.borrower.findUnique({ where: { userId: user.id } });
      if (!b) throw new NotFoundException('ไม่พบข้อมูลผู้กู้');
      borrowerId = b.id;
    }
    if (!borrowerId) throw new BadRequestException('ต้องระบุ borrowerId');
    const borrower = await this.prisma.borrower.findUnique({ where: { id: borrowerId } });
    if (!borrower) throw new NotFoundException('ไม่พบลูกค้า');

    const compliance = await this.preview(borrower.province, dto);
    if (!compliance.ok) throw new BadRequestException('ผิดเงื่อนไขพิโก: ' + compliance.violations.join(' | '));

    const created = await this.prisma.loanApplication.create({
      data: { borrowerId, amount: toSatang(dto.amount), annualRatePct: dto.annualRatePct, termMonths: dto.termMonths, purpose: dto.purpose, occupation: dto.occupation, monthlyIncome: dto.monthlyIncome, idCardFront: dto.idCardFront, idCardBack: dto.idCardBack, selfieWithId: dto.selfieWithId, salarySlip: dto.salarySlip, guarantorName: dto.guarantorName, guarantorPhone: dto.guarantorPhone, guarantorIdCard: dto.guarantorIdCard, collateralType: dto.collateralType, collateralDetail: dto.collateralDetail, collateralValue: dto.collateralValue, collateralPhoto: dto.collateralPhoto, collateralRef: dto.collateralRef },
    });
    try {
      const okDocs = !!(dto.idCardFront && dto.idCardBack && dto.selfieWithId);
      const okSecurity = !!((dto.collateralType && dto.collateralType !== 'ไม่มีหลักประกัน' && dto.collateralDetail) || (dto.guarantorName && dto.guarantorPhone));
      const ltvMap: any = { 'ทองคำ': 0.9, 'รถยนต์/มอเตอร์ไซค์': 0.6, 'ที่ดิน/โฉนด (จำนอง)': 0.7, 'อื่นๆ': 0.5 };
      const ltvr = ltvMap[dto.collateralType as any] || 0;
      const okLtv = !(ltvr > 0 && dto.collateralValue) || ((dto.amount as number) <= (dto.collateralValue as number) * ltvr + 1);
      const bor = await this.prisma.borrower.findUnique({ where: { id: (created as any).borrowerId } });
      const okBorrower = !!(bor && bor.address && bor.phone);
      if (okDocs && okSecurity && okLtv && okBorrower) {
        await this.loans.approve((created as any).id, 'อนุมัติอัตโนมัติ: ข้อมูลครบและผ่านเกณฑ์');
      }
    } catch (e) {}
    return created;
  }

  async list(status?: string) {
    const apps = await this.prisma.loanApplication.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' }, take: 200, include: { borrower: true },
    });
    return apps.map((a) => ({ ...a, amount: toTHB(a.amount) }));
  }
  async mine(userId: string) {
    const b = await this.prisma.borrower.findUnique({ where: { userId } });
    if (!b) return [];
    const apps = await this.prisma.loanApplication.findMany({ where: { borrowerId: b.id }, orderBy: { createdAt: 'desc' } });
    return apps.map((a) => ({ ...a, amount: toTHB(a.amount) }));
  }
}
