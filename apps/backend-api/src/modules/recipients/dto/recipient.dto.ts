import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
export class CreateRecipientDto {
  @ApiProperty() @IsString() nickname: string;
  @ApiProperty() @IsString() accountNumber: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bankName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() promptPayId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFavorite?: boolean;
}
