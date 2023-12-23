import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { formatResponse } from '../utils/wrapper';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UserService {
  prisma: PrismaService;
  bcrypt: any;
  constructor(private _prisma: PrismaService) {
    this.prisma = _prisma;
    this.bcrypt = bcrypt;
  }
  async register(registerDto: RegisterDto) {
    const saltOrRounds = 10;
    const { email, fullName, password, companyName } = registerDto;
    const emailLower = email.toLowerCase();
    // check by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: emailLower,
      },
    });
    if (user) {
      return formatResponse('Email already exist', null);
    }

    const hashPwd = await bcrypt.hash(password, saltOrRounds);

    const createUser = await this.prisma.user.create({
      data: {
        email: emailLower,
        fullname: fullName,
        company_name: companyName,
        password: hashPwd,
      },
    });
    return formatResponse('success', { userId: createUser.user_id });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const emailLower = email.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email: emailLower,
      },
    });
    if (!user) {
      return formatResponse('User not found', null);
    }

    const cekPass = await bcrypt.compare(password, user.password);
    if (!cekPass) {
      return formatResponse('User/Password incorrent', null);
    }

    const payload = {
      userId: user.user_id,
      company_name: user.company_name,
    };
    const token = sign(payload, process.env.SECRET_KEY, {
      expiresIn: process.env.EXPIRES_IN,
    });

    const res = {
      accessToken: token,
      data: {
        userId: user.user_id,
        fullName: user.fullname,
        email: user.email,
        companyName: user.company_name,
      },
    };
    return formatResponse('success', res);
  }
}
