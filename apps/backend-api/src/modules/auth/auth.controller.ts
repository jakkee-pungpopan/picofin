import { Body, Controller, Post, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, SetPinDto, VerifyPinDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register') @ApiOperation({ summary: 'Register new customer' })
  register(@Body() dto: RegisterDto, @Req() req: any) { return this.auth.register(dto, req.ip); }

  @Post('login') @HttpCode(200) @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto, @Req() req: any) { return this.auth.login(dto, req.ip); }

  @Post('refresh') @HttpCode(200) @ApiOperation({ summary: 'Rotate refresh token' })
  refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('logout') @HttpCode(200) @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  logout(@CurrentUser('id') id: string) { return this.auth.logout(id); }

  @Post('pin') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({ summary: 'Set 6-digit PIN' })
  setPin(@CurrentUser('id') id: string, @Body() dto: SetPinDto) { return this.auth.setPin(id, dto.pin); }

  @Post('pin/verify') @HttpCode(200) @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  verifyPin(@CurrentUser('id') id: string, @Body() dto: VerifyPinDto) { return this.auth.verifyPin(id, dto.pin); }
}
