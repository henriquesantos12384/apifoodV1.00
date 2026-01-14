import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { PrinterType, PrinterFormat } from "@prisma/client";

export class CreatePrinterDto {
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  systemName: string;

  @IsEnum(PrinterType)
  type: PrinterType;

  @IsEnum(PrinterFormat)
  format: PrinterFormat;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
