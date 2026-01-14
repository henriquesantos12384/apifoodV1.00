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
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CreateCustomerAddressDto } from "./dto/create-customer-address.dto";
import { UpdateCustomerAddressDto } from "./dto/update-customer-address.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Public()
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll(@Query("companyId") companyId: string) {
    return this.customersService.findAll(companyId);
  }

  @Public()
  @Get("phone")
  findByPhone(
    @Query("companyId") companyId: string,
    @Query("phone") phone: string
  ) {
    return this.customersService.findByPhone(companyId, phone);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.customersService.remove(id);
  }

  // --- Addresses ---

  @Public()
  @Post(":id/addresses")
  createAddress(
    @Param("id") customerId: string,
    @Body() createCustomerAddressDto: CreateCustomerAddressDto
  ) {
    return this.customersService.createAddress(
      customerId,
      createCustomerAddressDto
    );
  }

  @Public()
  @Get(":id/addresses")
  findAllAddresses(@Param("id") customerId: string) {
    return this.customersService.findAllAddresses(customerId);
  }

  @Patch("addresses/:addressId")
  updateAddress(
    @Param("addressId") addressId: string,
    @Body() updateCustomerAddressDto: UpdateCustomerAddressDto
  ) {
    return this.customersService.updateAddress(
      addressId,
      updateCustomerAddressDto
    );
  }

  @Delete("addresses/:addressId")
  removeAddress(@Param("addressId") addressId: string) {
    return this.customersService.removeAddress(addressId);
  }
}
