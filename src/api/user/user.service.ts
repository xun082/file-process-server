import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, name: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}
