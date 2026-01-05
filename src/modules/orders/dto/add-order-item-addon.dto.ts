import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddOrderItemAddonDto {
  @IsString()
  additionalId: string;

  @IsNumber()
  @Type(() => Number)
  price: number;
}
