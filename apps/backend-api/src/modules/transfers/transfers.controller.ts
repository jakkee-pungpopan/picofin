import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('transfers') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransfersController {
  constructor(private transfers: TransfersService) {}
  @Post() @ApiOperation({ summary: 'Create mock transfer (atomic)' })
  create(@CurrentUser('id') id: string, @Body() dto: CreateTransferDto, @Req() req: any) {
    return this.transfers.create(id, dto, req.ip);
  }
}
