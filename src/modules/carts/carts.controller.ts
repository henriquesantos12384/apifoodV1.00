import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { CartsService } from "./carts.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("carts")
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Public()
  @Get("table/:tableId")
  getCart(
    @Param("tableId") tableId: string,
    @Query("companyId") companyId: string
  ) {
    // If companyId provided, getting or creating is safe
    if (companyId) {
      return this.cartsService.getOrCreateCart(companyId, tableId);
    }
    return this.cartsService.findByTable(tableId);
  }

  @Public()
  @Post("table/:tableId/items")
  addItem(
    @Param("tableId") tableId: string,
    @Body()
    body: {
      productId: string;
      quantity: number;
      notes?: string;
      companyId: string;
    }
  ) {
    return this.cartsService.addItem(tableId, body.companyId, body);
  }

  @Public()
  @Post("table/:tableId/pizzas")
  addPizza(
    @Param("tableId") tableId: string,
    @Body()
    body: {
      sizeId: string;
      borderId?: string;
      flavorIds: string[];
      quantity: number;
      observation?: string;
      companyId: string;
    }
  ) {
    return this.cartsService.addPizza(tableId, body.companyId, body);
  }

  @Public()
  @Delete("items/:itemId")
  removeItem(@Param("itemId") itemId: string) {
    return this.cartsService.removeItem(itemId);
  }

  @Public()
  @Delete("pizzas/:pizzaId")
  removePizza(@Param("pizzaId") pizzaId: string) {
    return this.cartsService.removePizza(pizzaId);
  }

  @Public()
  @Delete("table/:tableId")
  clearCart(@Param("tableId") tableId: string) {
    return this.cartsService.clearCart(tableId);
  }
}
