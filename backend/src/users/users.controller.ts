import {
  Controller,
  Req,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthRequest } from '../auth/types/auth.request';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { UserWishesDto } from './dto/user-wishes.dto';
import { Wish } from '../wishes/entities/wish.entity';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOwn(@Req() req: AuthRequest): Promise<UserProfileResponseDto> {
    return this.usersService.findOne({ id: req.user.id });
  }

  @Patch('me')
  update(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateOne({ id: req.user.id }, updateUserDto);
  }

  @Get('me/wishes')
  async getOwnWishes(@Req() req: AuthRequest): Promise<Wish[]> {
    const user = await this.usersService.findOne({ id: req.user.id });
    return user.wishes;
  }

  @Get(':username')
  async findOne(
    @Param('username') username: string,
  ): Promise<UserPublicProfileResponseDto> {
    return this.usersService.findOne({ username });
  }

  @Get(':username/wishes')
  async getWishes(
    @Param('username') username: string,
  ): Promise<UserWishesDto[]> {
    const user = await this.usersService.findOne({ username });
    return user.wishes;
  }

  @Post('find')
  async findMany(
    @Body() findUsersDto: FindUsersDto,
  ): Promise<UserProfileResponseDto[]> {
    return this.usersService.findMany(findUsersDto.query);
  }
}
