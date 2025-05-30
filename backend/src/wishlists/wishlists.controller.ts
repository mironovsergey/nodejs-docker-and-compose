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
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async findAll(): Promise<Wishlist[]> {
    return this.wishlistsService.findMany({});
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async create(
    @Req() req: AuthRequest,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const userId = req.user.id;
    return this.wishlistsService.create(createWishlistDto, userId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: number): Promise<Wishlist> {
    return this.wishlistsService.findOne({ id });
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return this.wishlistsService.updateOne(
      { id },
      updateWishlistDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async removeOne(
    @Req() req: AuthRequest,
    @Param('id') id: number,
  ): Promise<Wishlist> {
    return this.wishlistsService.removeOne({ id }, req.user.id);
  }
}
