import { PartialType } from "@nestjs/mapped-types";
import { CreatePizzaBorderDto } from "./create-pizza-border.dto";

export class UpdatePizzaBorderDto extends PartialType(CreatePizzaBorderDto) {}
