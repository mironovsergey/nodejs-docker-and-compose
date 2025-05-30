import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from '../wishes/wishes.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const queryRunner =
      this.wishlistsRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const owner = await this.usersService.findOne({ id: userId });

      const items = createWishlistDto.itemsId
        ? await this.wishesService.findManyByIds(createWishlistDto.itemsId)
        : [];

      const wishlist = this.wishlistsRepository.create({
        ...createWishlistDto,
        owner,
        items,
      });

      const savedWishlist = await queryRunner.manager.save(wishlist);

      await queryRunner.commitTransaction();
      return savedWishlist;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: query,
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    return wishlist;
  }

  async findMany(query: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      where: query,
      relations: ['owner', 'items'],
    });
  }

  async updateOne(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(query);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужие списки желаний');
    }

    const queryRunner =
      this.wishlistsRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updateWishlistDto.itemsId) {
        wishlist.items = await this.wishesService.findManyByIds(
          updateWishlistDto.itemsId,
        );
      }

      const updatedWishlist = this.wishlistsRepository.create({
        ...wishlist,
        ...updateWishlistDto,
      });

      const savedWishlist = await queryRunner.manager.save(updatedWishlist);

      await queryRunner.commitTransaction();
      return savedWishlist;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeOne(
    query: FindOptionsWhere<Wishlist>,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(query);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалять чужие списки желаний');
    }

    return this.wishlistsRepository.remove(wishlist);
  }
}
