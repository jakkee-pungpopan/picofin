import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  private sha256(v: string) { return crypto.createHash('sha256').update(v).digest('hex'); }

  private async issueTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email, role: 'USER' };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL || '900s',
    });
    const refreshToken = await this.jwt.signAsync({ sub: user.id }, {
      secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    });
    // store hashed refresh token for rotation
    const decoded: any = this.jwt.decode(refreshToken);
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: this.sha256(refreshToken), expiresAt: new Date(decoded.exp * 1000) },
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, ip?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const acctNo = Math.floor(1000000000 + Math.random() * 8999999999).toString();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email, fullName: dto.fullName, phone: dto.phone, passwordHash,
        accounts: { create: [{ accountNumber: acctNo, name: 'Savings Account', type: 'SAVINGS', isPrimary: true, balance: BigInt(0) }] },
      },
    });
    await this.audit.log({ actorType: 'USER', actorId: user.id, action: 'AUTH_REGISTER', entity: 'User', entityId: user.id, ip });
    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email, fullName: user.fullName }, ...tokens };
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account suspended');
    await this.audit.log({ actorType: 'USER', actorId: user.id, action: 'AUTH_LOGIN', ip });
    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email, fullName: user.fullName, biometricEnabled: user.biometricEnabled }, ...tokens };
  }

  // Refresh token rotation: validate old, revoke it, issue a fresh pair.
  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch { throw new UnauthorizedException('Invalid refresh token'); }
    const hash = this.sha256(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({ where: { userId: payload.sub, tokenHash: hash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expired or revoked');
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    await this.audit.log({ actorType: 'USER', actorId: userId, action: 'AUTH_LOGOUT' });
    return { success: true };
  }

  async setPin(userId: string, pin: string) {
    const pinHash = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { pinHash } });
    return { success: true };
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.pinHash) throw new BadRequestException('PIN not set');
    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) throw new UnauthorizedException('Invalid PIN');
    return { success: true };
  }
}
