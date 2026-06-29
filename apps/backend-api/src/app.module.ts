import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { RecipientsModule } from './modules/recipients/recipients.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillersModule } from './modules/billers/billers.module';
import { QrModule } from './modules/qr/qr.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.RATE_LIMIT_TTL ?? 60) * 1000,
      limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
    }]),
    PrismaModule, AuditModule, AuthModule, UsersModule, AccountsModule,
    TransactionsModule, TransfersModule, RecipientsModule, NotificationsModule,
    BillersModule, QrModule, AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
