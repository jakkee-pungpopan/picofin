import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class BillersService {
  constructor(private prisma: PrismaService) {}
  list() { return this.prisma.biller.findMany({ where: { isActive: true } }); }
  // Placeholder: mock bill payment / mobile top-up. No real money movement.
  pay(userId: string, billerCode: string, amount: number, ref: string) {
    return { success: true, billerCode, amount, ref, status: 'MOCKED',
      notice: 'Bill payment is a placeholder. No real transaction occurs.' };
  }
}
