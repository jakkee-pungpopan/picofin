import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';
export class CreateBorrowerDto {
  @ApiProperty() @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ example: '1100700123456' }) @IsString() nationalId: string;
  @ApiProperty({ example: 'เชียงใหม่' }) @IsString() province: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
}
