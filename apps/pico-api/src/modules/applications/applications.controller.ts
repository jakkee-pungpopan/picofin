import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('applications') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private s: ApplicationsService) {}
  @Post() @ApiOperation({ summary: 'ยื่นคำขอกู้ (ลูกค้า หรือ ผู้ประกอบการยื่นแทน)' })
  create(@CurrentUser() u: any, @Body() dto: CreateApplicationDto) { return this.s.create(u, dto); }
  @Get('mine') mine(@CurrentUser('id') id: string) { return this.s.mine(id); }
  @Get() @UseGuards(RolesGuard) @Roles('OPERATOR', 'STAFF')
  list(@Query('status') status?: string) { return this.s.list(status); }
}
