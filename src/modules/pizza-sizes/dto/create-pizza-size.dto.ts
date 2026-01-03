import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreatePizzaSizeDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  slices: number;

  @IsInt()
  @IsNotEmpty()
  maxFlavors: number;

  @IsInt()
  @IsOptional()
  diameterCm?: number;

  @IsInt()
  @IsOptional()
  serves?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
