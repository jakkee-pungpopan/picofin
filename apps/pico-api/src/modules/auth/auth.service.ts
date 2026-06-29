import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterBorrowerDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  private sign(u: { id: string; email: string; role: string }) {
    return this.jwt.signAsync({ sub: u.id, email: u.email, role: u.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL || '8h' });
  }
  async login(dto: LoginDto) {
    const u = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!u || !(await bcrypt.compare(dto.password, u.passwordHash))) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    return { user: { id: u.id, email: u.email, fullName: u.fullName, role: u.role }, accessToken: await this.sign(u) };
  }
  async registerBorrower(dto: RegisterBorrowerDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } })) throw new ConflictException('อีเมลนี้ถูกใช้แล้ว');
    if (await this.prisma.borrower.findUnique({ where: { nationalId: dto.nationalId } })) throw new ConflictException('เลขบัตรประชาชนนี้ลงทะเบียนแล้ว');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, fullName: dto.fullName, passwordHash, role: 'BORROWER',
        borrower: { create: { fullName: dto.fullName, nationalId: dto.nationalId, province: dto.province, phone: dto.phone, address: dto.address } } },
    });
    return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, accessToken: await this.sign(user) };
  }
}
