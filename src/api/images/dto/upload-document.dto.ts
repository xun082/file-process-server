import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum DocumentCategory {
  REPORT = 'report',
  CONTRACT = 'contract',
  MANUAL = 'manual',
  OTHER = 'other',
}

export class UploadDocumentDto {
  @ApiProperty({
    enum: DocumentCategory,
    description: '文档类别',
    example: DocumentCategory.REPORT,
    required: false,
  })
  @IsEnum(DocumentCategory)
  @IsOptional()
  category?: DocumentCategory;

  @ApiProperty({
    description: '文档描述',
    example: '2024年第一季度报告',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
