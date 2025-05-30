import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...rest } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.usersRepository.create({
        ...rest,
        password: hashedPassword,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Пользователь с таким username или email уже существует',
        );
      }
      throw error;
    }
  }

  async findOne(query: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: query,
      relations: ['wishes', 'wishlists', 'offers'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findOneWithPassword(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findMany(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
      relations: ['wishes', 'wishlists', 'offers'],
    });
  }

  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(query);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.usersRepository.save({ ...user, ...updateUserDto });
  }

  async removeOne(query: FindOptionsWhere<User>): Promise<User> {
    const user = await this.findOne(query);
    return this.usersRepository.remove(user);
  }
}
