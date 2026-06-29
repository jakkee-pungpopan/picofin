import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export class AdminLoginDto {
  @ApiProperty({ example: 'admin@novabank.local' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Admin@123' }) @IsString() password: string;
}
