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
import { PizzaFlavorsService } from "./pizza-flavors.service";
import { CreatePizzaFlavorDto } from "./dto/create-pizza-flavor.dto";
import { UpdatePizzaFlavorDto } from "./dto/update-pizza-flavor.dto";

@Controller("pizza-flavors")
export class PizzaFlavorsController {
  constructor(private readonly pizzaFlavorsService: PizzaFlavorsService) {}

  @Post()
  create(@Body() createPizzaFlavorDto: CreatePizzaFlavorDto) {
    return this.pizzaFlavorsService.create(createPizzaFlavorDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string, @Query("type") type?: string) {
    return this.pizzaFlavorsService.findAll(companyId, type);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.pizzaFlavorsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePizzaFlavorDto: UpdatePizzaFlavorDto
  ) {
    return this.pizzaFlavorsService.update(id, updatePizzaFlavorDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pizzaFlavorsService.remove(id);
  }
}
