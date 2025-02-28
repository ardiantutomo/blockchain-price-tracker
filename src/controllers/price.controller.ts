import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PriceService } from '../services/price.service';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('hourly')
  @ApiOperation({ summary: 'Get hourly prices for a specific chain' })
  @ApiResponse({ status: 200, description: 'Return hourly prices.' })
  async getHourlyPrices(@Query('chain') chain: string) {
    return this.priceService.getHourlyPrices(chain);
  }

  @Get('swap-rate')
  @ApiOperation({ summary: 'Get swap rate from ETH to BTC' })
  @ApiResponse({ status: 200, description: 'Return swap rate and fees.' })
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    return this.priceService.getSwapRate(ethAmount);
  }
}
