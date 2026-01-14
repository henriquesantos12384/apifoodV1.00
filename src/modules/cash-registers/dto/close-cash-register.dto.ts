import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CloseCashRegisterDto {
  @IsNotEmpty()
  @IsNumber()
  closingAmount: number;

  @IsNotEmpty()
  @IsUUID()
  closedBy: string;
}
