import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto } from './dto/login-dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../utils/auth-guard/auth-guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @HttpCode(200)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return await this.userService.register(registerDto);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.userService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @HttpCode(200)
  getProfile(@Request() req) {
    return req.user;
  }
}
