import { PickType } from '@nestjs/mapped-types';
import { User } from '../../users/entities/user.entity';

export class SigninUserDto extends PickType(User, [
  'username',
  'password',
] as const) {}

export class SigninUserResponseDto {
  access_token: string;
}
