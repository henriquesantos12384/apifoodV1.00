import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get("order/:orderId")
  findByOrder(@Param("orderId") orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
