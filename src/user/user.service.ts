import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { formatResponse } from '../utils/wrapper';

@Injectable()
export class UserService {
  async register(registerDto: RegisterDto) {
    return formatResponse('success', {});
  }

  async login(loginDto: LoginDto) {
    return formatResponse('success', {});
  }
}
