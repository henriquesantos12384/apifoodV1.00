import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreateCashRegisterDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsNumber()
  openingAmount: number;

  @IsNotEmpty()
  @IsUUID()
  openedBy: string;
}
