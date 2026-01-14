import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsUUID()
  receivedBy: string;
}
