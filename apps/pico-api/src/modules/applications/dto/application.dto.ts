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
  @ApiProperty({ required: false, description: 'สลิปเงินเดือน (base64)' }) @IsOptional() @IsString() salarySlip?: string;
  @ApiProperty({ required: false, example: 'สมศักดิ์ มั่นคง', description: 'ชื่อผู้ค้ำประกัน' }) @IsOptional() @IsString() guarantorName?: string;
  @ApiProperty({ required: false, example: '0823456789', description: 'เบอร์โทรผู้ค้ำประกัน' }) @IsOptional() @IsString() guarantorPhone?: string;
  @ApiProperty({ required: false, description: 'รูปบัตรประชาชนผู้ค้ำประกัน (base64)' }) @IsOptional() @IsString() guarantorIdCard?: string;
  @ApiProperty({ required: false, example: 'ทองคำ', description: 'ประเภทหลักประกัน (ไม่มี/บุคคลค้ำ/ทอง/รถ/ที่ดิน/อื่นๆ)' }) @IsOptional() @IsString() collateralType?: string;
  @ApiProperty({ required: false, example: 'ทองรูปพรรณ 2 บาท', description: 'รายละเอียดหลักประกัน' }) @IsOptional() @IsString() collateralDetail?: string;
  @ApiProperty({ required: false, example: 50000, description: 'มูลค่าประเมินหลักประกัน (บาท)' }) @IsOptional() @IsNumber() collateralValue?: number;
  @ApiProperty({ required: false, description: 'รูปถ่ายหลักประกัน (base64)' }) @IsOptional() @IsString() collateralPhoto?: string;
  @ApiProperty({ required: false, example: 'โฉนดเลขที่ 12345 / ทะเบียน กข1234', description: 'เลขโฉนด/ทะเบียนรถ/เลขอ้างอิงหลักประกัน' }) @IsOptional() @IsString() collateralRef?: string;
  @ApiProperty({ required: false, description: 'รหัสผู้กู้ (ผู้ประกอบการระบุ borrowerId; ลูกค้าไม่ต้องส่ง)' }) @IsOptional() @IsString() borrowerId?: string;
}
