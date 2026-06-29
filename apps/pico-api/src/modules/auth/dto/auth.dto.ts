import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'owner@picofin.local' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Password@123' }) @IsString() password: string;
}
export class RegisterBorrowerDto {
  @ApiProperty() @IsString() @MinLength(2) fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ example: '1100700123456' }) @IsString() nationalId: string;
  @ApiProperty({ example: 'เชียงใหม่' }) @IsString() province: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
}
