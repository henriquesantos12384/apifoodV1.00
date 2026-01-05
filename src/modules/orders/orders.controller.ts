import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { AddOrderPizzaDto } from "./dto/add-order-pizza.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.ordersService.findAll(companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddOrderItemDto) {
    return this.ordersService.addItem(id, dto);
  }

  @Post(':id/pizzas')
  addPizza(@Param('id') id: string, @Body() dto: AddOrderPizzaDto) {
    return this.ordersService.addPizza(id, dto);
  }

  @Post('items/:itemId/addons/:additionalId')
  addItemAddon(@Param('itemId') itemId: string, @Param('additionalId') additionalId: string) {
    return this.ordersService.addItemAddon(itemId, additionalId);
  }

  @Get('table/:tableId')
  findByTable(@Param('tableId') tableId: string) {
    return this.ordersService.findByTable(tableId);
  }

  @Get('open')
  findOpen(@Query('companyId') companyId: string) {
    return this.ordersService.findOpen(companyId);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ordersService.remove(id);
  }
}
