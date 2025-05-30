import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthRequest } from '../auth/types/auth.request';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async create(
    @Req() req: AuthRequest,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    const userId = req.user.id;
    return this.wishesService.create(createWishDto, userId);
  }

  @Get('last')
  async findLast(): Promise<Wish[]> {
    return this.wishesService.findLast(40);
  }

  @Get('top')
  async findTop(): Promise<Wish[]> {
    return this.wishesService.findTop(20);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: number): Promise<Wish> {
    return this.wishesService.findOne({ id });
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    return this.wishesService.updateOne({ id }, updateWishDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async removeOne(
    @Req() req: AuthRequest,
    @Param('id') id: number,
  ): Promise<Wish> {
    return this.wishesService.removeOne({ id }, req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async copyWish(
    @Param('id') id: number,
    @Req() req: AuthRequest,
  ): Promise<Wish> {
    const userId = req.user.id;
    return this.wishesService.copyWish(id, userId);
  }
}
