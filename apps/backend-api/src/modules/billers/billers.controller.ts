import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillersService } from './billers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('billers') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('billers')
export class BillersController {
  constructor(private billers: BillersService) {}
  @Get() list() { return this.billers.list(); }
  @Post('pay') @ApiOperation({ summary: 'Pay bill / top-up (placeholder)' })
  pay(@CurrentUser('id') id: string, @Body() b: { billerCode: string; amount: number; ref: string }) {
    return this.billers.pay(id, b.billerCode, b.amount, b.ref);
  }
}
