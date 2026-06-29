import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
export class CreatePaymentDto {
  @ApiProperty({ example: 1066.19, description: 'จำนวนเงินที่รับชำระ (บาท)' }) @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ required: false, example: 'CASH', description: 'ช่องทางชำระ เช่น CASH (เงินสด) หรือ TRANSFER (โอน)' }) @IsOptional() @IsString() method?: string;
  @ApiProperty({ required: false, example: 'ชำระงวดที่ 1', description: 'หมายเหตุ' }) @IsOptional() @IsString() note?: string;
}
