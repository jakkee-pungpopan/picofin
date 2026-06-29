import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
export class CreateBorrowerDto {
  @ApiProperty({ example: 'สมหญิง รักดี', description: 'ชื่อ-นามสกุลผู้กู้' }) @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ example: '1100700123456', description: 'เลขบัตรประชาชน 13 หลัก' }) @IsString() @Matches(/^[0-9]{13}$/, { message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก' }) nationalId: string;
  @ApiProperty({ example: 'เชียงใหม่', description: 'จังหวัด (ต้องอยู่ในเขตเดียวกับผู้ประกอบการ)' }) @IsString() province: string;
  @ApiProperty({ required: false, example: '0812345678', description: 'เบอร์โทรศัพท์' }) @IsString() @MinLength(9, { message: 'กรุณากรอกเบอร์โทรศัพท์' }) phone: string;
  @ApiProperty({ required: false, example: '99 หมู่ 1 ต.ช้างเผือก', description: 'ที่อยู่' }) @IsString() @MinLength(5, { message: 'กรุณากรอกที่อยู่' }) address: string;
}
