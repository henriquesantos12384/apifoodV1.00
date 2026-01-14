import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CreateCustomerAddressDto } from "./dto/create-customer-address.dto";
import { UpdateCustomerAddressDto } from "./dto/update-customer-address.dto";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
      include: {
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: "desc" },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: "desc" },
        },
      },
    });
  }

  findByPhone(companyId: string, phone: string) {
    return this.prisma.customer.findUnique({
      where: {
        companyId_phone: {
          companyId,
          phone,
        },
      },
      include: {
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: "desc" },
        },
      },
    });
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  // --- Addresses ---

  async createAddress(customerId: string, data: CreateCustomerAddressDto) {
    // If this is the first address or marked as default, handle defaults
    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, isActive: true },
        data: { isDefault: false },
      });
    } else {
      // If it's the first address, make it default automatically
      const count = await this.prisma.customerAddress.count({
        where: { customerId, isActive: true },
      });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    return this.prisma.customerAddress.create({
      data: {
        ...data,
        customerId,
      },
    });
  }

  findAllAddresses(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId, isActive: true },
      orderBy: { isDefault: "desc" },
    });
  }

  async updateAddress(id: string, data: UpdateCustomerAddressDto) {
    if (data.isDefault) {
      const address = await this.prisma.customerAddress.findUnique({
        where: { id },
      });
      if (address) {
        await this.prisma.customerAddress.updateMany({
          where: { customerId: address.customerId, isActive: true },
          data: { isDefault: false },
        });
      }
    }

    return this.prisma.customerAddress.update({
      where: { id },
      data,
    });
  }

  async removeAddress(id: string) {
    // Soft delete
    return this.prisma.customerAddress.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
