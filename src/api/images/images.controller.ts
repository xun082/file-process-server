import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';

import { ImagesService } from './images.service';

import { ResponseDto } from '@/common/dto/response.dto';
import ApiFileUploadDecorate from '@/core/decorate/upload.decorators';

// 将常量移到类外部
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_FILE_TYPES = '.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$';

@ApiTags('文件工具')
@Controller('images')
export class ImagesController {
  private readonly SUPPORTED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  constructor(private readonly imagesService: ImagesService) {}

  // 上传单个文档的接口
  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiFileUploadDecorate('上传单个文档', true, {
    category: {
      type: 'string',
      enum: ['report', 'contract', 'manual', 'other'],
      description: '文档类别',
      required: false,
    },
    description: {
      type: 'string',
      description: '文档描述',
      required: false,
    },
  })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE, // 使用外部常量
            message: `File size should not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          }),
          new FileTypeValidator({
            fileType: SUPPORTED_FILE_TYPES, // 使用外部常量
          }),
        ],
        fileIsRequired: true,
        errorHttpStatusCode: 400,
      }),
    )
    file: MulterFile,
  ): Promise<ResponseDto<any>> {
    try {
      // 验证文件
      this.validateDocument(file);

      // 处理文件上传
      return await this.imagesService.uploadDocument(file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private validateDocument(file: MulterFile): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.SUPPORTED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported types are: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT`,
      );
    }
  }
}
