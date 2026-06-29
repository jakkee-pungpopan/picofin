import { Body, Controller, Get, Post, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post('login') @HttpCode(200) @ApiOperation({ summary: 'Admin login' })
  login(@Body() dto: AdminLoginDto) { return this.admin.login(dto.email, dto.password); }

  @Get('dashboard') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN', 'AUDITOR') @ApiBearerAuth()
  dashboard() { return this.admin.dashboard(); }

  @Get('users') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN', 'AUDITOR') @ApiBearerAuth()
  users(@Query('search') search?: string) { return this.admin.users(search); }

  @Get('transactions') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN', 'AUDITOR') @ApiBearerAuth()
  transactions(@Query('search') search?: string) { return this.admin.transactions(search); }

  @Get('audit-logs') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'AUDITOR') @ApiBearerAuth()
  audit() { return this.admin.auditLogs(); }
}
