import { PartialType } from "@nestjs/mapped-types";
import { CreatePizzaFlavorDto } from "./create-pizza-flavor.dto";

export class UpdatePizzaFlavorDto extends PartialType(CreatePizzaFlavorDto) {}
