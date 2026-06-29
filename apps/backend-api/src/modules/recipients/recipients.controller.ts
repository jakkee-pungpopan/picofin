import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecipientsService } from './recipients.service';
import { CreateRecipientDto } from './dto/recipient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('recipients') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('recipients')
export class RecipientsController {
  constructor(private recipients: RecipientsService) {}
  @Get() list(@CurrentUser('id') id: string) { return this.recipients.list(id); }
  @Post() create(@CurrentUser('id') id: string, @Body() dto: CreateRecipientDto) { return this.recipients.create(id, dto); }
}
