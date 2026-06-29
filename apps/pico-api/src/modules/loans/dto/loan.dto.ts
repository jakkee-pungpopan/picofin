import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
export class ApproveDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
}
export class RejectDto {
  @ApiProperty({ example: 'รายได้ไม่เพียงพอ' }) @IsString() reason: string;
}
