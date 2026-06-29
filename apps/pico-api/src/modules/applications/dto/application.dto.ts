import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
export class CreateApplicationDto {
  @ApiProperty({ example: 20000, description: 'วงเงินที่ขอ (บาท)' }) @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ example: 24, description: 'ดอกเบี้ยต่อปี (%)' }) @IsNumber() @Min(0) @Max(100) annualRatePct: number;
  @ApiProperty({ example: 12 }) @IsInt() @Min(1) @Max(60) termMonths: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() purpose?: string;
  @ApiProperty({ required: false, description: 'ผู้ประกอบการระบุ borrowerId; ลูกค้าไม่ต้องส่ง' }) @IsOptional() @IsString() borrowerId?: string;
}
