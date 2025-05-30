import { OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class UserPublicProfileResponseDto extends OmitType(User, [
  'email',
  'password',
  'wishes',
  'offers',
  'wishlists',
] as const) {}
