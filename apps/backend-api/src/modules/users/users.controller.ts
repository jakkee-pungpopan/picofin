import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @Get('me') me(@CurrentUser('id') id: string) { return this.users.me(id); }
  @Patch('me/security') security(@CurrentUser('id') id: string, @Body() b: { biometricEnabled: boolean }) {
    return this.users.updateSecurity(id, b.biometricEnabled);
  }
}
