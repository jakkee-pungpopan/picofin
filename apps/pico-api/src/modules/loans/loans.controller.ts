import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { ApproveDto, RejectDto } from './dto/loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('สัญญาเงินกู้') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private s: LoansService) {}
  @Get('mine') mine(@CurrentUser('id') id: string) { return this.s.mine(id); }
  @Get() @UseGuards(RolesGuard) @Roles('OPERATOR', 'STAFF') list() { return this.s.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.s.get(id); }
  @Post('applications/:appId/approve') @UseGuards(RolesGuard) @Roles('OPERATOR', 'STAFF') @ApiOperation({ summary: 'อนุมัติคำขอ -> สร้างสัญญา + ตารางผ่อน (atomic)' })
  approve(@Param('appId') appId: string, @Body() dto: ApproveDto) { return this.s.approve(appId, dto.note); }
  @Post('applications/:appId/reject') @UseGuards(RolesGuard) @Roles('OPERATOR', 'STAFF')
  reject(@Param('appId') appId: string, @Body() dto: RejectDto) { return this.s.reject(appId, dto.reason); }
}
