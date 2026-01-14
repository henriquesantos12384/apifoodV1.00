import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { PrintersService } from "./printers.service";
import { CreatePrinterDto } from "./dto/create-printer.dto";
import { UpdatePrinterDto } from "./dto/update-printer.dto";

@Controller("printers")
export class PrintersController {
  constructor(private readonly printersService: PrintersService) {}

  @Post()
  create(@Body() createPrinterDto: CreatePrinterDto) {
    return this.printersService.create(createPrinterDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.printersService.findAll(companyId);
  }

  @Get("system")
  getSystemPrinters() {
    return this.printersService.getSystemPrinters();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.printersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatePrinterDto: UpdatePrinterDto) {
    return this.printersService.update(id, updatePrinterDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.printersService.remove(id);
  }

  @Post(":id/test")
  testPrint(@Param("id") id: string) {
    return this.printersService.testPrint(id);
  }
}
