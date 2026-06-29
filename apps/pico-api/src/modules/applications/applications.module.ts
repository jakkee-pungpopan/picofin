import { LoansModule } from '../loans/loans.module';
import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
@Module({ imports: [LoansModule], providers: [ApplicationsService], controllers: [ApplicationsController], exports: [ApplicationsService] })
export class ApplicationsModule {}
