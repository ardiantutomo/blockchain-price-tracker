import { Injectable } from '@nestjs/common';
import { AlertRepository } from 'src/repositories/alert.repository';

@Injectable()
export class AlertService {
  constructor(private readonly alertRepository: AlertRepository) {}

  async setPriceAlert(chain: string, price: number, email: string) {
    return this.alertRepository.createAlert(chain, price, email);
  }

  async getActiveAlerts() {
    return this.alertRepository.findActiveAlerts();
  }

  async updateAlertStatus(id: string, active: boolean) {
    return this.alertRepository.updateAlertStatus(id, active);
  }
}
