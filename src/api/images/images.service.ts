import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';

import { CompressImageDto } from './dto/compress-image.dto';
import { ConvertImageDto } from './dto/convert-image.dto';

import { ResponseDto } from '@/common/dto/response.dto';

@Injectable()
export class ImagesService {
  async compressImages(
    files: MulterFile[],
    data: CompressImageDto,
  ): Promise<ResponseDto<Array<string>>> {
    const { compressionRatio } = data;

    const compressedFiles = [];

    for (const file of files) {
      console.log(file);

      const compressedBuffer = await sharp(file.buffer)
        .jpeg({ quality: compressionRatio }) // 使用前端传入的压缩比例
        .toBuffer();

      compressedFiles.push({
        originalname: file.originalname,
        buffer: compressedBuffer,
      });
    }

    return {
      data: ['1', '2'],
    };
  }

  async convertImages(
    files: MulterFile[],
    convertImageDto: ConvertImageDto,
  ): Promise<ResponseDto<Array<string>>> {
    console.log(convertImageDto);

    files.map((file) => `converted_url/${file.filename}`);

    return {
      data: ['1', '2'],
    };
  }
}
