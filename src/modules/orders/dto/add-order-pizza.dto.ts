import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FlavorDto {
  @IsString()
  flavorId: string;
}

export class AddOrderPizzaDto {
  @IsString()
  sizeId: string;

  @IsOptional()
  @IsString()
  borderId?: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  finalPrice: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlavorDto)
  flavors: FlavorDto[];
}
