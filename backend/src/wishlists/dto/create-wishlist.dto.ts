import { IsOptional, IsArray } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Wishlist } from '../entities/wishlist.entity';

export class CreateWishlistDto extends OmitType(Wishlist, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {
  @IsArray()
  @IsOptional()
  itemsId?: number[];
}
