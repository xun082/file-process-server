import { Controller, Post, UploadedFiles, UseInterceptors, Body } from '@nestjs/common';
import { FilesInterceptor, MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { ApiTags } from '@nestjs/swagger';

import { ImagesService } from './images.service';
import { CompressImageDto } from './dto/compress-image.dto';
import { ConvertImageDto } from './dto/convert-image.dto';

import { ResponseDto } from '@/common/dto/response.dto';
import ApiFileUploadDecorate from '@/core/decorate/upload.decorators';

@ApiTags('图片工具')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 压缩图片的接口
  @Post('compress')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiFileUploadDecorate('上传多个图片并压缩', false, {
    compressionRatio: {
      type: 'number',
      description: '压缩比例，范围从1到100',
      example: 80,
    },
  })
  async compressImages(
    @UploadedFiles() files: MulterFile[],
    @Body() compressImageDto: CompressImageDto,
  ): Promise<ResponseDto<Array<string>>> {
    return await this.imagesService.compressImages(files, compressImageDto);
  }

  // 转换图片格式的接口
  @Post('convert')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiFileUploadDecorate('上传多个图片并转换格式', false, {
    format: {
      type: 'string',
      description: '转换格式（支持 png, jpg, webp）',
      enum: ['png', 'jpg', 'webp'],
      example: 'jpg',
    },
  })
  async convertImages(
    @UploadedFiles() files: MulterFile[],
    @Body() convertImageDto: ConvertImageDto,
  ): Promise<ResponseDto<Array<string>>> {
    return await this.imagesService.convertImages(files, convertImageDto);
  }
}
