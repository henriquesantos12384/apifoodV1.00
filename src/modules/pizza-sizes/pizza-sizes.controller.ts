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
import { PizzaSizesService } from "./pizza-sizes.service";
import { CreatePizzaSizeDto } from "./dto/create-pizza-size.dto";
import { UpdatePizzaSizeDto } from "./dto/update-pizza-size.dto";
import { Public } from "src/common/decorators/public.decorator";

@Controller("pizza-sizes")
export class PizzaSizesController {
  constructor(private readonly pizzaSizesService: PizzaSizesService) {}

  @Post()
  create(@Body() createPizzaSizeDto: CreatePizzaSizeDto) {
    return this.pizzaSizesService.create(createPizzaSizeDto);
  }

  @Public()
  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.pizzaSizesService.findAll(companyId);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.pizzaSizesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePizzaSizeDto: UpdatePizzaSizeDto
  ) {
    return this.pizzaSizesService.update(id, updatePizzaSizeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pizzaSizesService.remove(id);
  }
}
