import { IsNumber } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Offer } from '../entities/offer.entity';

export class CreateOfferDto extends OmitType(Offer, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {
  @IsNumber()
  itemId: number;
}
