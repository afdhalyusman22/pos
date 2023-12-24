import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LoginDto } from './login-dto';

export class RegisterDto extends PartialType(LoginDto) {
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  companyName: string;
}

export class RegisterResponse {
  userId: string;
}
export class RegisterResponseDto {
  data: RegisterResponse;
}
