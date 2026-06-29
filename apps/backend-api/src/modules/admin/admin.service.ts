import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { toTHB } from '../../common/utils/money';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private audit: AuditService) {}

  async login(email: string, password: string, ip?: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash)))
      throw new UnauthorizedException('Invalid admin credentials');
    await this.audit.log({ actorType: 'ADMIN', actorId: admin.id, action: 'ADMIN_LOGIN', ip });
    const accessToken = await this.jwt.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '8h' },
    );
    return { admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role }, accessToken };
  }

  async dashboard() {
    const [userCount, accountCount, txnAgg, txnCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.account.count(),
      this.prisma.transaction.aggregate({ _sum: { amount: true } }),
      this.prisma.transaction.count(),
    ]);
    return {
      users: userCount,
      accounts: accountCount,
      transactions: txnCount,
      totalVolumeTHB: toTHB(txnAgg._sum.amount ?? BigInt(0)),
      notice: 'Demo data only.',
    };
  }

  async users(search?: string) {
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { fullName: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const list = await this.prisma.user.findMany({
      where, take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, phone: true, status: true, createdAt: true, _count: { select: { accounts: true } } },
    });
    return list;
  }

  async transactions(search?: string) {
    const where = search ? { reference: { contains: search, mode: 'insensitive' as const } } : {};
    const list = await this.prisma.transaction.findMany({ where, take: 100, orderBy: { createdAt: 'desc' } });
    return list.map((t) => ({ ...t, amount: toTHB(t.amount), fee: toTHB(t.fee), balanceAfter: t.balanceAfter != null ? toTHB(t.balanceAfter) : null }));
  }

  auditLogs() { return this.prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: 'desc' } }); }
}
