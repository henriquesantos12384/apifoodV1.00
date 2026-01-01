import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";

export class CreateNicheDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
