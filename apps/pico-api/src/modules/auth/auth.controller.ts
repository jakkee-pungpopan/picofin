import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterBorrowerDto } from './dto/auth.dto';
@ApiTags('เข้าสู่ระบบ') @Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login') @HttpCode(200) @ApiOperation({ summary: 'เข้าสู่ระบบ (ผู้ประกอบการ/พนักงาน/ลูกค้า)' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('register') @ApiOperation({ summary: 'ลงทะเบียนลูกค้า (ผู้กู้)' })
  register(@Body() dto: RegisterBorrowerDto) { return this.auth.registerBorrower(dto); }
}
