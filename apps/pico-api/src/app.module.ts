import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BorrowersModule } from './modules/borrowers/borrowers.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { LoansModule } from './modules/loans/loans.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: Number(process.env.RATE_LIMIT_TTL ?? 60) * 1000, limit: Number(process.env.RATE_LIMIT_MAX ?? 100) }]),
    PrismaModule, AuthModule, BorrowersModule, ApplicationsModule, LoansModule, PaymentsModule, DashboardModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
