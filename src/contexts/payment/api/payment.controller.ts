import { Body, Controller, Get, Post, Req, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from '../app/service/payment.service';
import type { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('products')
  async getProducts() {
    return this.stripeService.getProducts();
  }

  @Get('customers')
  async getCustomers() {
    return this.stripeService.getCustomers();
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; currency: string }) {
    const { amount, currency } = body;
    return this.stripeService.createPaymentIntent(amount, currency);
  }

  @Post('subscriptions')
  async createSubscription(@Body() body: { customerId: string; priceId: string }) {
    const { customerId, priceId } = body;
    return this.stripeService.createSubscription(customerId, priceId);
  }

  @Post('customers')
  async createCustomer(@Body() body: { email: string; name: string }) {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('products')
  async createProduct(@Body() body: { name: string; description: string; price: number }) {
    return this.stripeService.createProduct(body.name, body.description, body.price);
  }

  @Post('refunds')
  async refundPayment(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.refundPayment(body.paymentIntentId);
  }

  @Post('payment-links')
  async createPaymentLink(@Body() body: { priceId: string }) {
    return this.stripeService.createPaymentLink(body.priceId);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { userId: string; priceId: string }) {
    return this.stripeService.createCheckoutSession(body.userId, body.priceId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body is missing for webhook verification');
    }
    return this.stripeService.handleWebhook(req.rawBody, signature);
  }

  @Get('balance')
  async getBalance() {
    return this.stripeService.getBalance();
  }
}