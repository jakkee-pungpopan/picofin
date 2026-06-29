import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'owner@picofin.local', description: 'อีเมลสำหรับเข้าสู่ระบบ' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Password@123', description: 'รหัสผ่าน' }) @IsString() password: string;
}
export class RegisterBorrowerDto {
  @ApiProperty({ example: 'สมชาย ใจดี', description: 'ชื่อ-นามสกุล' }) @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ example: 'somchai@example.com', description: 'อีเมล' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Password@123', description: 'รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)' }) @IsString() @MinLength(8) password: string;
  @ApiProperty({ example: '1100700123456', description: 'เลขบัตรประชาชน 13 หลัก' }) @IsString() nationalId: string;
  @ApiProperty({ example: 'เชียงใหม่', description: 'จังหวัด (ต้องอยู่ในเขตเดียวกับผู้ประกอบการ)' }) @IsString() province: string;
  @ApiProperty({ required: false, example: '0812345678', description: 'เบอร์โทรศัพท์' }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false, example: '123 ถ.นิมมานเหมินท์ ต.สุเทพ', description: 'ที่อยู่' }) @IsOptional() @IsString() address?: string;
}
