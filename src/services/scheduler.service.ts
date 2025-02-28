import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PriceService } from './price.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly priceService: PriceService) {}

  @Cron('*/5 * * * * *')
  handleCron() {
    this.priceService.updatePrices().catch(console.error);
  }
}
