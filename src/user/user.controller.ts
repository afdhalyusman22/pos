import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.userService.register(registerDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }
}
