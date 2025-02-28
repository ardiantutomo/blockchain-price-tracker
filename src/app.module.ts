import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertController } from './controllers/alert.controller';
import { PriceController } from './controllers/price.controller';
import { AlertRepository } from './repositories/alert.repository';
import { PriceRepository } from './repositories/price.repository';
import { AlertService } from './services/alert.service';
import { PriceService } from './services/price.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
  controllers: [PriceController, AlertController],
  providers: [
    PriceService,
    PriceRepository,
    SchedulerService,
    AlertService,
    AlertRepository,
  ],
})
export class AppModule {}
