import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('notifications') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}
  @Get() list(@CurrentUser('id') id: string) { return this.notifications.list(id); }
  @Patch(':id/read') read(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.notifications.markRead(uid, id); }
}
