import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OrderType, PaymentMethod } from "@prisma/client";

class CreateOrderItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateOrderPizzaFlavorDto {
  @IsString()
  flavorId: string;
}

class CreateOrderPizzaDto {
  @IsString()
  sizeId: string;

  @IsOptional()
  @IsString()
  borderId?: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  finalPrice: number; // preço calculado no cliente/backend

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPizzaFlavorDto)
  flavors: CreateOrderPizzaFlavorDto[];
}

export class CreateOrderDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  waiterId?: string;

  @IsOptional()
  @IsString()
  deliverymanId?: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPizzaDto)
  pizzas: CreateOrderPizzaDto[];

  @Type(() => Number)
  @IsNumber()
  totalProducts: number;

  @Type(() => Number)
  @IsNumber()
  deliveryFee: number;

  @Type(() => Number)
  @IsNumber()
  discount: number;

  @Type(() => Number)
  @IsNumber()
  totalFinal: number;
}
