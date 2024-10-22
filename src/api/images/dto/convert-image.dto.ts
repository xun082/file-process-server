import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ImageFormat {
  PNG = 'png',
  JPG = 'jpg',
  WEBP = 'webp',
}

export class ConvertImageDto {
  @ApiProperty({
    description: '转换格式（支持 png、jpg、webp）',
    example: ImageFormat.JPG,
  })
  @IsEnum(ImageFormat, { message: '仅支持png, jpg和webp格式' })
  format: ImageFormat;
}
