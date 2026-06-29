import { Module } from '@nestjs/common';
import { BillersService } from './billers.service';
import { BillersController } from './billers.controller';
@Module({ providers: [BillersService], controllers: [BillersController] })
export class BillersModule {}
