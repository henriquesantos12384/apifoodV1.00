import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from "@nestjs/common";
import { CashRegistersService } from "./cash-registers.service";
import { CreateCashRegisterDto } from "./dto/create-cash-register.dto";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";

@Controller("cash-registers")
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  @Post("open")
  open(@Body() createCashRegisterDto: CreateCashRegisterDto) {
    return this.cashRegistersService.open(createCashRegisterDto);
  }

  @Post("close/:id")
  close(
    @Param("id") id: string,
    @Body() closeCashRegisterDto: CloseCashRegisterDto
  ) {
    return this.cashRegistersService.close(id, closeCashRegisterDto);
  }

  @Get("open")
  findOpen(@Query("companyId") companyId: string) {
    return this.cashRegistersService.findOpen(companyId);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.cashRegistersService.findAll(companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.cashRegistersService.findOne(id);
  }
}
