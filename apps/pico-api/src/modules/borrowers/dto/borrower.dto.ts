import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';
export class CreateBorrowerDto {
  @ApiProperty({ example: 'สมหญิง รักดี', description: 'ชื่อ-นามสกุลผู้กู้' }) @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ example: '1100700123456', description: 'เลขบัตรประชาชน 13 หลัก' }) @IsString() nationalId: string;
  @ApiProperty({ example: 'เชียงใหม่', description: 'จังหวัด (ต้องอยู่ในเขตเดียวกับผู้ประกอบการ)' }) @IsString() province: string;
  @ApiProperty({ required: false, example: '0812345678', description: 'เบอร์โทรศัพท์' }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false, example: '99 หมู่ 1 ต.ช้างเผือก', description: 'ที่อยู่' }) @IsOptional() @IsString() address?: string;
}
