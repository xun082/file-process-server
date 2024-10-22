import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

import { MiNiOConfigEnum } from '../enum/config.enum';

@Injectable()
export class MinioService {
  private readonly bucketName: string;
  private readonly expiry: number = 24 * 60 * 60; // 预签名URL有效期：24小时

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    protected configService: ConfigService,
  ) {
    this.bucketName = this.configService.get(MiNiOConfigEnum.MINIO_BUCKET);
  }

  async getBuckets() {
    return await this.minioClient.listBuckets();
  }

  async generatePresignedPostPolicy(
    bucketName: string,
    fileName: string,
    expiry: number = this.expiry,
  ) {
    const policy = new Minio.PostPolicy();
    policy.setBucket(bucketName);
    policy.setKey(fileName);
    policy.setExpires(new Date(Date.now() + expiry * 1000));

    const postPolicy = await this.minioClient.presignedPostPolicy(policy);

    return {
      postPolicy,
      url: `localhost/${bucketName}`,
    };
  }

  async listObjects(bucketName: string) {
    const stream = this.minioClient.listObjectsV2(bucketName, '', true);
    const objects = [];

    for await (const obj of stream) {
      objects.push(obj);
    }

    return objects;
  }

  async getFile(bucketName: string, fileName: string) {
    return await this.minioClient.getObject(bucketName, fileName);
  }

  async deleteFile(bucketName: string, fileName: string) {
    await this.minioClient.removeObject(bucketName, fileName);
  }
}
