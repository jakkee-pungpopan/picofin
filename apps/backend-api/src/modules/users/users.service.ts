import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async me(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, fullName: true, status: true, biometricEnabled: true, createdAt: true, pinHash: true },
    });
    if (!u) throw new NotFoundException('User not found');
    const { pinHash, ...rest } = u;
    return { ...rest, hasPin: !!pinHash };
  }
  async updateSecurity(userId: string, biometricEnabled: boolean) {
    await this.prisma.user.update({ where: { id: userId }, data: { biometricEnabled } });
    return { success: true };
  }
}
