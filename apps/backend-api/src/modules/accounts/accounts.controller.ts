import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('accounts') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accounts: AccountsService) {}
  @Get() list(@CurrentUser('id') id: string) { return this.accounts.list(id); }
  @Get(':id') get(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.accounts.get(uid, id); }
}
