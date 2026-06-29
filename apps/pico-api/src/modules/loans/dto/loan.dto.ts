import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
export class ApproveDto {
  @ApiProperty({ required: false, example: 'อนุมัติตามเงื่อนไข', description: 'หมายเหตุการอนุมัติ' }) @IsOptional() @IsString() note?: string;
}
export class RejectDto {
  @ApiProperty({ example: 'รายได้ไม่เพียงพอ', description: 'เหตุผลที่ปฏิเสธคำขอ' }) @IsString() reason: string;
}
