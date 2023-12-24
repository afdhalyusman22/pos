import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;
}

export class LoginResponse {
  userId: string;
  email: string;
  fullName: string;
  companyName: string;
}

export class LoginResponseDto {
  accessToken: string;
  data: LoginResponse;
}
