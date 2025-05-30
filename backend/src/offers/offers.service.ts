import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const queryRunner =
      this.offersRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wish = await this.wishesService.findOne({
        id: createOfferDto.itemId,
      });

      const user = await this.usersService.findOne({ id: userId });

      if (wish.owner.id === user.id) {
        throw new BadRequestException('Нельзя скидываться на свою хотелку');
      }

      if (Number(wish.raised) >= Number(wish.price)) {
        throw new BadRequestException('Сбор средств окончен');
      }

      if (createOfferDto.amount > Number(wish.price) - Number(wish.raised)) {
        throw new BadRequestException('Сумма превышает остаток');
      }

      wish.raised = Number(wish.raised) + createOfferDto.amount;

      await queryRunner.manager.save(wish);

      const offer = this.offersRepository.create({
        ...createOfferDto,
        user,
        item: wish,
      });

      const savedOffer = await queryRunner.manager.save(offer);

      await queryRunner.commitTransaction();
      return savedOffer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(query: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: query,
      relations: ['user', 'item'],
    });

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }

    return offer;
  }

  async findMany(query: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return this.offersRepository.find({
      where: query,
      relations: ['user', 'item'],
    });
  }

  async updateOne(
    query: FindOptionsWhere<Offer>,
    updateOfferDto: UpdateOfferDto,
  ): Promise<Offer> {
    const offer = await this.findOne(query);

    if (updateOfferDto.itemId) {
      const wish = await this.wishesService.findOne({
        id: updateOfferDto.itemId,
      });
      offer.item = wish;
    }

    return this.offersRepository.save({ ...offer, ...updateOfferDto });
  }

  async removeOne(query: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.findOne(query);
    return this.offersRepository.remove(offer);
  }
}
