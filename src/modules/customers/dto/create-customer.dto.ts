import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
