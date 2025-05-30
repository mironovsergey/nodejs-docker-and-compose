import {
  Controller,
  Req,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthRequest } from '../auth/types/auth.request';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Controller('offers')
@UseGuards(JwtGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: AuthRequest,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    const userId = req.user.id;
    return this.offersService.create(createOfferDto, userId);
  }

  @Get()
  async findAll(): Promise<Offer[]> {
    return this.offersService.findMany({});
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Offer> {
    return this.offersService.findOne({ id });
  }
}
