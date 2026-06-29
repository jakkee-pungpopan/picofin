import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
export class CreateApplicationDto {
  @ApiProperty({ example: 20000, description: 'วงเงินที่ขอกู้ (บาท)' }) @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ example: 24, description: 'อัตราดอกเบี้ยต่อปี (%) — PICO ไม่เกิน 36%, PICO+ ไม่เกิน 28%' }) @IsNumber() @Min(0) @Max(100) annualRatePct: number;
  @ApiProperty({ example: 12, description: 'จำนวนงวดผ่อน (เดือน)' }) @IsInt() @Min(1) @Max(60) termMonths: number;
  @ApiProperty({ required: false, example: 'เงินทุนหมุนเวียน', description: 'วัตถุประสงค์การกู้' }) @IsOptional() @IsString() purpose?: string;
  @ApiProperty({ required: false, example: 'พนักงานบริษัท', description: 'อาชีพ' }) @IsOptional() @IsString() occupation?: string;
  @ApiProperty({ required: false, example: 25000, description: 'รายได้ต่อเดือน (บาท)' }) @IsOptional() @IsNumber() monthlyIncome?: number;
  @ApiProperty({ required: false, description: 'รูปบัตรประชาชนด้านหน้า (base64)' }) @IsOptional() @IsString() idCardFront?: string;
  @ApiProperty({ required: false, description: 'รูปบัตรประชาชนด้านหลัง (base64)' }) @IsOptional() @IsString() idCardBack?: string;
  @ApiProperty({ required: false, description: 'รูปถ่ายคู่บัตรประชาชน (base64)' }) @IsOptional() @IsString() selfieWithId?: string;
  @ApiProperty({ required: false, description: 'รหัสผู้กู้ (ผู้ประกอบการระบุ borrowerId; ลูกค้าไม่ต้องส่ง)' }) @IsOptional() @IsString() borrowerId?: string;
}
