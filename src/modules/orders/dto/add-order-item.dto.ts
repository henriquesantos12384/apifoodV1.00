import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddOrderItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  addons?: { additionalId: string }[];
}
