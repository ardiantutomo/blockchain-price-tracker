import { EvmChain } from '@moralisweb3/common-evm-utils';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Moralis from 'moralis';
import { PriceRepository } from '../repositories/price.repository';
import { AlertService } from './alert.service';

@Injectable()
export class PriceService implements OnModuleInit {
  constructor(
    private readonly priceRepository: PriceRepository,
    private readonly alertService: AlertService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async onModuleInit() {
    await Moralis.start({
      apiKey: this.configService.get('MORALIS_API_KEY'),
    });
  }

  async getHourlyPrices(chain: string) {
    const prices = await this.priceRepository.findPricesSinceYesterday(chain);

    const hourlyPrices = [];
    const seenHours = new Set();

    for (let i = 0; i < 24; i++) {
      const price = prices.find((p) => p.createdAt.getHours() === i);
      if (price) {
        hourlyPrices.push(price);
        seenHours.add(i);
      } else {
        hourlyPrices.push({
          price: 0,
          createdAt: new Date(new Date().setHours(i, 0, 0, 0)),
        });
      }
    }

    return hourlyPrices;
  }

  async getSwapRate(ethAmount: number) {
    const ethPrice = await this.getEthereumPrice();
    const btcAmount = ethAmount * ethPrice.ethToBtc;
    const fee = ethAmount * 0.03;
    return {
      btcAmount,
      fee: {
        eth: fee,
        usd: fee * ethPrice.ethToUsd,
      },
    };
  }

  async updatePrices() {
    const ethPrice = await this.getEthereumPrice();
    const polygonPrice = await this.getErc20Price(
      this.configService.get('POLYGON_ADDRESS'),
    );

    await this.priceRepository.createPrice(
      'Ethereum',
      parseFloat(ethPrice.ethToUsd),
    );
    await this.priceRepository.createPrice(
      'Polygon',
      parseFloat(polygonPrice.usdPrice.toString()),
    );

    await Promise.all([
      this.checkAlerts(),
      this.sendPriceIncreaseAlert(ethPrice.ethToUsd),
    ]);
  }

  private async sendPriceIncreaseAlert(currentPrice: number) {
    const chains = ['Ethereum', 'Polygon'];
    const alertEmail = this.configService.get('ALERT_EMAIL');

    for (const chain of chains) {
      const previousPrice = await this.getPriceXHoursAgo(chain, 1);

      const priceIncrease =
        ((currentPrice - previousPrice) / previousPrice) * 100;

      if (priceIncrease > 3) {
        await this.sendEmail(
          alertEmail,
          `Price Alert: ${chain} price increased by more than 3%`,
        );
      }
    }
  }

  private async getPriceXHoursAgo(chain: string, hours: number) {
    const prices = await this.priceRepository.findPricesSinceYesterday(chain);
    const price = prices.find((p) => p.createdAt.getHours() === hours);
    if (!price) {
      return 0;
    }
    return price.price;
  }

  private async checkAlerts() {
    const alerts = await this.alertService.getActiveAlerts();

    for (const alert of alerts) {
      const latestPrice = await this.priceRepository.findLatestPrice(
        alert.chain,
      );

      if (latestPrice && latestPrice.price >= alert.price) {
        this.sendEmail(
          alert.email,
          `Price Alert: ${alert.chain} has reached ${alert.price}`,
        );
        await this.alertService.updateAlertStatus(alert.id, false);
      }
    }
  }

  private async sendEmail(to: string, subject: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text: subject,
    });
  }

  private async getErc20Price(address: string) {
    try {
      const chain = EvmChain.ETHEREUM;
      const price = await Moralis.EvmApi.token.getTokenPrice({
        address: address,
        chain,
      });
      return price.toJSON();
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  }

  async getEthereumPrice() {
    const response = await axios.get(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${this.configService.get('ETHERSCAN_API_KEY')}`,
    );
    return {
      ethToUsd: response.data.result.ethusd,
      ethToBtc: response.data.result.ethbtc,
      updatedAt: response.data.result.ethupdatedAt,
    };
  }

  async getBitcoinPrice() {
    try {
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2/erc20/price?chain=bitcoin`,
        {
          headers: {
            'X-API-Key': this.configService.get('MORALIS_API_KEY'),
          },
        },
      );
      console.log('Bitcoin Price (USD): ', response.data.usdPrice);
    } catch (error) {
      console.error('Error fetching BTC price:', error.response.data);
    }
  }
}
