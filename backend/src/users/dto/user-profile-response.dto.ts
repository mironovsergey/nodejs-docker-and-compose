import { OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class UserProfileResponseDto extends OmitType(User, [
  'password',
  'wishes',
  'offers',
  'wishlists',
] as const) {}
