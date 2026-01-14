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
import { DeliveryAreasService } from "./delivery-areas.service";
import { CreateDeliveryAreaDto } from "./dto/create-delivery-area.dto";
import { UpdateDeliveryAreaDto } from "./dto/update-delivery-area.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("delivery-areas")
export class DeliveryAreasController {
  constructor(private readonly deliveryAreasService: DeliveryAreasService) {}

  @Post()
  create(@Body() createDeliveryAreaDto: CreateDeliveryAreaDto) {
    return this.deliveryAreasService.create(createDeliveryAreaDto);
  }

  @Public()
  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.deliveryAreasService.findAll(companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.deliveryAreasService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateDeliveryAreaDto: UpdateDeliveryAreaDto
  ) {
    return this.deliveryAreasService.update(id, updateDeliveryAreaDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.deliveryAreasService.remove(id);
  }
}
