import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  Logger,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { AddOrderPizzaDto } from "./dto/add-order-pizza.dto";
import { Public } from "../../common/decorators/public.decorator";

import { BatchOrderItemsDto } from "./dto/batch-order-items.dto";

@Controller("orders")
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post(":id/batch")
  async addBatch(@Param("id") id: string, @Body() dto: BatchOrderItemsDto) {
    this.logger.log(
      `Received BATCH request for order ${id}. Items: ${dto.items.length}, Pizzas: ${dto.pizzas.length}, Print: ${dto.printAfter}`
    );
    return this.ordersService.addBatch(id, dto);
  }

  @Public()
  @Get("delivery-queue")
  findDeliveryQueue(@Query("companyId") companyId: string) {
    return this.ordersService.findDeliveryQueue(companyId);
  }

  @Public()
  @Get("driver/:driverId/orders")
  findDriverOrders(@Param("driverId") driverId: string) {
    return this.ordersService.findDriverOrders(driverId);
  }

  @Public()
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

  @Public()
  @Post(":id/items")
  addItem(@Param("id") id: string, @Body() dto: AddOrderItemDto) {
    return this.ordersService.addItem(id, dto);
  }

  @Public()
  @Post(":id/pizzas")
  addPizza(@Param("id") id: string, @Body() dto: AddOrderPizzaDto) {
    return this.ordersService.addPizza(id, dto);
  }

  @Public()
  @Patch(":id/assign-driver")
  assignDriver(@Param("id") id: string, @Body("driverId") driverId: string) {
    return this.ordersService.assignDriver(id, driverId);
  }

  @Public()
  @Patch(":id/release-driver")
  releaseDriver(@Param("id") id: string) {
    return this.ordersService.releaseDriver(id);
  }

  @Public()
  @Patch(":id/start-delivery")
  startDelivery(@Param("id") id: string) {
    return this.ordersService.startDelivery(id);
  }

  @Public()
  @Patch(":id/location")
  updateLocation(
    @Param("id") id: string,
    @Body() body: { lat: number; lng: number }
  ) {
    return this.ordersService.updateDriverLocation(id, body.lat, body.lng);
  }

  @Public()
  @Get("tracking/:token")
  getTracking(@Param("token") token: string) {
    return this.ordersService.getTrackingByToken(token);
  }

  @Public()
  @Post(":id/print")
  printOrder(@Param("id") id: string) {
    this.logger.log(`Received print request for order: ${id}`);
    return this.ordersService.printOrder(id);
  }

  @Get("table/:tableId")
  findByTable(@Param("tableId") tableId: string) {
    return this.ordersService.findByTable(tableId);
  }

  @Get("open")
  findOpen(@Query("companyId") companyId: string) {
    return this.ordersService.findOpen(companyId);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Delete("items/:itemId")
  removeItem(@Param("itemId") itemId: string) {
    return this.ordersService.removeItem(itemId);
  }

  @Patch("items/:itemId/notes")
  updateItemNotes(
    @Param("itemId") itemId: string,
    @Body("notes") notes: string
  ) {
    return this.ordersService.updateItemNotes(itemId, notes);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ordersService.remove(id);
  }
}
