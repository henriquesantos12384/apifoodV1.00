import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
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

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsOptional()
  @IsString()
  waiterId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsNumber()
  deliveryLatitude?: number;

  @IsOptional()
  @IsNumber()
  deliveryLongitude?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPizzaDto)
  pizzas?: CreateOrderPizzaDto[];

  @IsOptional()
  @IsNumber()
  totalProducts?: number;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  totalFinal?: number;
}
