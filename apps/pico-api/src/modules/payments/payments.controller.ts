import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags('payments') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('OPERATOR', 'STAFF')
@Controller('loans/:loanId/payments')
export class PaymentsController {
  constructor(private s: PaymentsService) {}
  @Post() @ApiOperation({ summary: 'บันทึกรับชำระ + ตัดงวด (atomic)' })
  pay(@Param('loanId') loanId: string, @Body() dto: CreatePaymentDto) { return this.s.pay(loanId, dto.amount, dto.method, dto.note); }
  @Get() list(@Param('loanId') loanId: string) { return this.s.list(loanId); }
}
