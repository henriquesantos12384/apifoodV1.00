import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { RestaurantTablesService } from "./restaurant-tables.service";
import { CreateRestaurantTableDto } from "./dto/create-restaurant-table.dto";
import { UpdateRestaurantTableDto } from "./dto/update-restaurant-table.dto";

@Controller("restaurant-tables")
export class RestaurantTablesController {
  constructor(
    private readonly restaurantTablesService: RestaurantTablesService
  ) {}

  @Post()
  create(@Body() createRestaurantTableDto: CreateRestaurantTableDto) {
    return this.restaurantTablesService.create(createRestaurantTableDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.restaurantTablesService.findAll(companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.restaurantTablesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateRestaurantTableDto: UpdateRestaurantTableDto
  ) {
    return this.restaurantTablesService.update(id, updateRestaurantTableDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.restaurantTablesService.remove(id);
  }
}
