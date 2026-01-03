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
import { PizzaBordersService } from "./pizza-borders.service";
import { CreatePizzaBorderDto } from "./dto/create-pizza-border.dto";
import { UpdatePizzaBorderDto } from "./dto/update-pizza-border.dto";

@Controller("pizza-borders")
export class PizzaBordersController {
  constructor(private readonly pizzaBordersService: PizzaBordersService) {}

  @Post()
  create(@Body() createPizzaBorderDto: CreatePizzaBorderDto) {
    return this.pizzaBordersService.create(createPizzaBorderDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.pizzaBordersService.findAll(companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.pizzaBordersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePizzaBorderDto: UpdatePizzaBorderDto
  ) {
    return this.pizzaBordersService.update(id, updatePizzaBorderDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pizzaBordersService.remove(id);
  }
}
