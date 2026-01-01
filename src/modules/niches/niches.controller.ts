import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { NichesService } from "./niches.service";
import { CreateNicheDto } from "./dto/create-niche.dto";
import { UpdateNicheDto } from "./dto/update-niche.dto";

@Controller("niches")
export class NichesController {
  constructor(private readonly nichesService: NichesService) {}

  @Post()
  create(@Body() createNicheDto: CreateNicheDto) {
    return this.nichesService.create(createNicheDto);
  }

  @Get()
  findAll() {
    return this.nichesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.nichesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateNicheDto: UpdateNicheDto) {
    return this.nichesService.update(id, updateNicheDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.nichesService.remove(id);
  }
}
