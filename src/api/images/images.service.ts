import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import * as mammoth from 'mammoth';
import * as pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { ResponseDto } from '@/common/dto/response.dto';
import { LoggerService } from '@/common/logs/logs.service';

interface DocumentContent {
  text: string;
  images: Array<{
    data: Buffer;
    contentType: string;
    extension: string;
  }>;
}

@Injectable()
export class ImagesService {
  constructor(private readonly logger: LoggerService) {}

  async uploadDocument(file: MulterFile): Promise<ResponseDto<DocumentContent>> {
    try {
      const content = await this.extractDocumentContent(file);

      // 这里可以添加存储逻辑，比如保存到 MinIO 或其他存储服务

      return {
        code: 200,
        message: 'Document processed successfully',
        data: content,
      };
    } catch (error) {
      this.logger.error({
        message: 'Failed to process document',
        prefix: 'DOCUMENT_PROCESSING',
        metadata: {
          fileName: file.originalname,
          fileType: file.mimetype,
          error: error.message,
        },
      });
      throw new BadRequestException('Failed to process document: ' + error.message);
    }
  }

  private async extractDocumentContent(file: MulterFile): Promise<DocumentContent> {
    const fileType = file.mimetype;
    const buffer = file.buffer;

    switch (fileType) {
      case 'application/pdf':
        return await this.extractPdfContent(buffer);
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractWordContent(buffer);
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return await this.extractExcelContent(buffer);
      case 'text/plain':
        return await this.extractTextContent(buffer);
      default:
        throw new BadRequestException(`Unsupported file type: ${fileType}`);
    }
  }

  private async extractPdfContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      const data = await pdf(buffer);

      return {
        text: data.text,
        images: [], // PDF 图片提取需要额外的处理
      };
    } catch (error) {
      throw new Error('Failed to extract PDF content: ' + error.message);
    }
  }

  private async extractWordContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      // 创建临时文件
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doc-'));
      const tempFile = path.join(tempDir, 'temp.docx');
      await fs.writeFile(tempFile, buffer);

      const result = await mammoth.extractRawText({ path: tempFile });
      const images = await mammoth.images({ path: tempFile });

      // 处理图片
      const processedImages = await Promise.all(
        images.map(async (image) => {
          const imageBuffer = await image.read();

          return {
            data: imageBuffer,
            contentType: image.contentType,
            extension: this.getImageExtension(image.contentType),
          };
        }),
      );

      // 清理临时文件
      await fs.rm(tempDir, { recursive: true });

      return {
        text: result.value,
        images: processedImages,
      };
    } catch (error) {
      throw new Error('Failed to extract Word content: ' + error.message);
    }
  }

  private async extractExcelContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      const workbook = XLSX.read(buffer);
      let text = '';

      // 遍历所有工作表
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_txt(sheet);
        text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      }

      return {
        text,
        images: [], // Excel 图片提取需要额外的处理
      };
    } catch (error) {
      throw new Error('Failed to extract Excel content: ' + error.message);
    }
  }

  private async extractTextContent(buffer: Buffer): Promise<DocumentContent> {
    try {
      return {
        text: buffer.toString('utf-8'),
        images: [],
      };
    } catch (error) {
      throw new Error('Failed to extract text content: ' + error.message);
    }
  }

  private getImageExtension(contentType: string): string {
    const extensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    return extensions[contentType] || '.bin';
  }
}
