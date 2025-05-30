import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const owner = await this.usersService.findOne({ id: userId });
    const wish = this.wishesRepository.create({ ...createWishDto, owner });
    return this.wishesRepository.save(wish);
  }

  async findOne(query: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: query,
      relations: ['owner', 'offers', 'wishlists'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    wish.offers = wish.offers.filter((offer) => !offer.hidden);

    return wish;
  }

  async findMany(query: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return this.wishesRepository.find({ where: query });
  }

  async findManyByIds(ids: number[]): Promise<Wish[]> {
    return this.wishesRepository.findBy({ id: In(ids) });
  }

  async findLast(limit: number): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findTop(limit: number): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: limit,
    });
  }

  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findOne(query);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужие желания');
    }

    return this.wishesRepository.save({ ...wish, ...updateWishDto });
  }

  async removeOne(
    query: FindOptionsWhere<Wish>,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findOne(query);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалять чужие желания');
    }

    return this.wishesRepository.remove(wish);
  }

  async copyWish(wishId: number, userId: number): Promise<Wish> {
    const queryRunner =
      this.wishesRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wish = await this.findOne({ id: wishId });
      const owner = await this.usersService.findOne({ id: userId });

      wish.copied += 1;
      await queryRunner.manager.save(wish);

      const { name, link, image, price, description, wishlists } = wish;

      const newWish = this.wishesRepository.create({
        name,
        link,
        image,
        price,
        description,
        owner,
        wishlists,
      });

      const savedWish = await queryRunner.manager.save(newWish);

      await queryRunner.commitTransaction();
      return savedWish;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
