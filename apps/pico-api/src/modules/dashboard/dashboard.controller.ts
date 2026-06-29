import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags('dashboard') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('OPERATOR', 'STAFF')
@Controller('dashboard')
export class DashboardController {
  constructor(private s: DashboardService) {}
  @Get() summary() { return this.s.summary(); }
}
