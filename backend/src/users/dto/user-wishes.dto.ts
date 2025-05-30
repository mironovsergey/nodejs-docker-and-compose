import { OmitType } from '@nestjs/mapped-types';
import { Wish } from '../../wishes/entities/wish.entity';

export class UserWishesDto extends OmitType(Wish, [
  'owner',
  'offers',
  'wishlists',
] as const) {}
