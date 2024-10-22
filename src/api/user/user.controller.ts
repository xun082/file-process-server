import { Controller, Get, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: any) {
    const { email, name } = createUserDto;

    return this.userService.createUser(email, name);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
