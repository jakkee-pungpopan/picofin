import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('qr') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  @Post('generate') @ApiOperation({ summary: 'Generate receive-money QR (placeholder)' })
  generate(@CurrentUser('id') id: string, @Body() b: { accountNumber: string; amount?: number }) {
    const payload = `NOVAQR|${b.accountNumber}|${b.amount ?? ''}|${Date.now()}`;
    return { qrPayload: payload, format: 'MOCK_PROMPTPAY',
      notice: 'QR generation is a placeholder. Not a real PromptPay payload.' };
  }
  @Post('scan') @ApiOperation({ summary: 'Decode scanned QR (placeholder)' })
  scan(@Body() b: { qrPayload: string }) {
    const [, accountNumber, amount] = (b.qrPayload || '').split('|');
    return { accountNumber: accountNumber ?? null, amount: amount ? Number(amount) : null, valid: !!accountNumber };
  }
}
