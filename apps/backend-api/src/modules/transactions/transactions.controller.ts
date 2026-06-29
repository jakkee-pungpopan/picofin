import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('transactions') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private txns: TransactionsService) {}
  @Get() @ApiQuery({ name: 'accountId', required: false })
  list(@CurrentUser('id') id: string, @Query('accountId') accountId?: string) {
    return this.txns.list(id, accountId);
  }
}
