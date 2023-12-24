import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto } from './dto/login-dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  _prisma: PrismaService;
  _jwtService: JwtService;
  _bcrypt: any;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this._prisma = prisma;
    this._bcrypt = bcrypt;
    this._jwtService = jwtService;
  }
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const saltOrRounds = 10;
    const { email, fullName, password, companyName } = registerDto;
    const emailLower = email.toLowerCase();
    // check by email
    const user = await this._prisma.user.findFirst({
      where: {
        email: emailLower,
      },
    });
    if (user) {
      throw new HttpException('Email already exist', HttpStatus.BAD_REQUEST);
    }

    const hashPwd = await this._bcrypt.hash(password, saltOrRounds);

    const createUser = await this._prisma.user.create({
      data: {
        email: emailLower,
        fullname: fullName,
        company_name: companyName,
        password: hashPwd,
      },
    });

    const res: RegisterResponseDto = {
      data: { userId: createUser.user_id },
    };

    return res;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const emailLower = email.toLowerCase();
    const user = await this._prisma.user.findFirst({
      where: {
        email: emailLower,
      },
    });
    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    const cekPass = await this._bcrypt.compare(password, user.password);
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
    const token = await this._jwtService.signAsync(payload);

    const res: LoginResponseDto = {
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
