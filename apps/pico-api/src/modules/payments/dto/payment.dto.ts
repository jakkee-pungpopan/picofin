import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
export class CreatePaymentDto {
  @ApiProperty({ example: 1066.19, description: 'จำนวนรับชำระ (บาท)' }) @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ required: false, example: 'CASH' }) @IsOptional() @IsString() method?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
}
