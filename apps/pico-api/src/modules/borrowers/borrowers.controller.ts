import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto } from './dto/borrower.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags('borrowers') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('OPERATOR', 'STAFF')
@Controller('borrowers')
export class BorrowersController {
  constructor(private s: BorrowersService) {}
  @Get() list(@Query('q') q?: string) { return this.s.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.s.get(id); }
  @Post() create(@Body() dto: CreateBorrowerDto) { return this.s.create(dto); }
}
