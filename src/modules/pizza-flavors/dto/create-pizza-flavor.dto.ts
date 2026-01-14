import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreatePizzaFlavorDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  sizePrices?: { sizeId: string; price: number }[];
}
