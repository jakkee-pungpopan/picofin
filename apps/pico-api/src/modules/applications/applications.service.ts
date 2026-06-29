import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/application.dto';
import { toSatang, toTHB } from '../../common/utils/money';
import { checkCompliance } from '../../common/utils/pico';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.loanApplication.create({
      data: { borrowerId, amount: toSatang(dto.amount), annualRatePct: dto.annualRatePct, termMonths: dto.termMonths, purpose: dto.purpose },
    });
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
