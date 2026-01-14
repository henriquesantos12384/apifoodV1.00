import { IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";

export class CreateRestaurantTableDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  tableNumber: number;
}
