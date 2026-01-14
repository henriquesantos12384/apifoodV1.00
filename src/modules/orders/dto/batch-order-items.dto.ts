import {
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { AddOrderItemDto } from "./add-order-item.dto";
import { AddOrderPizzaDto } from "./add-order-pizza.dto";

export class BatchOrderItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  items: AddOrderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOrderPizzaDto)
  pizzas: AddOrderPizzaDto[];

  @IsOptional()
  @IsBoolean()
  printAfter?: boolean;
}
