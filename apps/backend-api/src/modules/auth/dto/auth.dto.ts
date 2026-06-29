import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@novabank.local' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Password@123' }) @IsString() @MinLength(8) password: string;
  @ApiProperty({ example: 'New Customer' }) @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ example: '0810000003', required: false }) @IsOptional() @IsString() phone?: string;
}
export class LoginDto {
  @ApiProperty({ example: 'somchai@novabank.local' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Password@123' }) @IsString() password: string;
}
export class RefreshDto {
  @ApiProperty() @IsString() refreshToken: string;
}
export class SetPinDto {
  @ApiProperty({ example: '123456' }) @Matches(/^\d{6}$/, { message: 'PIN must be 6 digits' }) pin: string;
}
export class VerifyPinDto {
  @ApiProperty({ example: '123456' }) @Matches(/^\d{6}$/) pin: string;
}
