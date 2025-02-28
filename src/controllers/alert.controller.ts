import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertService } from '../services/alert.service';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('set-alert')
  @ApiOperation({ summary: 'Set a price alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chain: { type: 'string' },
        price: { type: 'number' },
        email: { type: 'string' },
      },
    },
  })
  async setPriceAlert(
    @Body() body: { chain: string; price: number; email: string },
  ) {
    return this.alertService.setPriceAlert(body.chain, body.price, body.email);
  }
}
