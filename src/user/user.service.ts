import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  prisma: PrismaService;
  jwtService: JwtService;
  bcrypt: any;
  constructor(
    private _prisma: PrismaService,
    private _jwtService: JwtService,
  ) {
    this.prisma = _prisma;
    this.bcrypt = bcrypt;
    this.jwtService = _jwtService;
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
      throw new HttpException('Email already exist', HttpStatus.BAD_REQUEST);
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

    return { data: { userId: createUser.user_id } };
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
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    const cekPass = await bcrypt.compare(password, user.password);
    if (!cekPass) {
      throw new HttpException(
        'user or password incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = {
      userId: user.user_id,
      company_name: user.company_name,
    };
    const token = await this.jwtService.signAsync(payload);

    const res = {
      accessToken: token,
      data: {
        userId: user.user_id,
        fullName: user.fullname,
        email: user.email,
        companyName: user.company_name,
      },
    };
    return res;
  }
}
