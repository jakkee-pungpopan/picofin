import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBorrowerDto } from './dto/borrower.dto';
@Injectable()
export class BorrowersService {
  constructor(private prisma: PrismaService) {}
  list(q?: string) {
    return this.prisma.borrower.findMany({
      where: q ? { OR: [{ fullName: { contains: q } }, { nationalId: { contains: q } }] } : {},
      orderBy: { createdAt: 'desc' }, take: 200,
      include: { _count: { select: { loans: true } } },
    });
  }
  async get(id: string) {
    const b = await this.prisma.borrower.findUnique({ where: { id }, include: { loans: true, applications: true } });
    if (!b) throw new NotFoundException('ไม่พบลูกค้า'); return b;
  }
  async create(dto: CreateBorrowerDto) {
    if (await this.prisma.borrower.findUnique({ where: { nationalId: dto.nationalId } })) throw new ConflictException('เลขบัตรประชาชนนี้มีอยู่แล้ว');
    return this.prisma.borrower.create({ data: dto });
  }
}
