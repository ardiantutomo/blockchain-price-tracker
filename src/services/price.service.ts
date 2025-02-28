import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Moralis from 'moralis';
import nodemailer from 'nodemailer';
import { PriceRepository } from '../repositories/price.repository';
import { AlertService } from './alert.service';

@Injectable()
export class PriceService implements OnModuleInit {
  constructor(
    private readonly priceRepository: PriceRepository,
    private readonly alertService: AlertService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await Moralis.start({
      apiKey: this.configService.get('MORALIS_API_KEY'),
    });
  }

  async getHourlyPrices(chain: string) {
    return this.priceRepository.findHourlyPrices(chain);
  }

  async getSwapRate(ethAmount: number) {
    const ethPrice = await this.getEthereumPrice();
    const btcAmount = ethAmount * ethPrice.ethToUsd * ethPrice.ethToBtc;
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

    // await this.checkAlerts();
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
        // await this.priceRepository.updateAlertStatus(alert.id, false);
      }
    }
  }

  private sendEmail(to: string, subject: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      text: subject,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
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
