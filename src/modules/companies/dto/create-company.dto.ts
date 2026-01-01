import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
} from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string; // The user who owns/created the company

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  nicheIds?: string[];
}
