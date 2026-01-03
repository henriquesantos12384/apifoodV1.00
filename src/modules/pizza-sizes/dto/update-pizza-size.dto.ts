import { PartialType } from "@nestjs/mapped-types";
import { CreatePizzaSizeDto } from "./create-pizza-size.dto";

export class UpdatePizzaSizeDto extends PartialType(CreatePizzaSizeDto) {}
