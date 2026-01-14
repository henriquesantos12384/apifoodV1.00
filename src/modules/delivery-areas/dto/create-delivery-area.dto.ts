import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateDeliveryAreaDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @IsNotEmpty()
  @IsNumber()
  deliveryFee: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
