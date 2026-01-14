import { PartialType } from "@nestjs/mapped-types";
import { CreateRestaurantTableDto } from "./create-restaurant-table.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateRestaurantTableDto extends PartialType(
  CreateRestaurantTableDto
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
