import { Body, Controller, Post } from '@nestjs/common';
import { AlertService } from '../services/alert.service';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('set-alert')
  async setPriceAlert(
    @Body() body: { chain: string; price: number; email: string },
  ) {
    return this.alertService.setPriceAlert(body.chain, body.price, body.email);
  }
}
