import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, IsIn } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ example: 'uuid-of-source-account' }) @IsString() fromAccountId: string;
  @ApiProperty({ example: '1234567890', description: 'Destination account number (internal or external mock)' })
  @IsString() toAccountNumber: string;
  @ApiProperty({ example: 100.5, description: 'Amount in THB' }) @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ example: 'OWN', enum: ['OWN', 'OTHER', 'PROMPTPAY'] }) @IsIn(['OWN', 'OTHER', 'PROMPTPAY']) channel: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
  @ApiProperty({ example: '123456', required: false, description: 'PIN confirmation (demo)' }) @IsOptional() @IsString() pin?: string;
}
