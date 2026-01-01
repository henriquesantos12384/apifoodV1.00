import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { AddUserDto } from "./dto/add-user.dto";
import { ChangeOwnerDto } from "./dto/change-owner.dto";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // Cria uma nova company.
  // Body exemplo: { name, ownerId, slug?, status? }
  // Observação: `name` do DTO é mapeado para `nameFantasy` no schema Prisma.
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  // Lista companies ativas (status != 'inactive').
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  // Busca company pelo slug (URL legível).
  // GET /companies/slug/:slug
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug);
  }

  // Busca company pelo CNPJ.
  // GET /companies/cnpj/:cnpj
  @Get('cnpj/:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.companiesService.findByCnpj(cnpj);
  }

  // Busca company por ID.
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companiesService.findOne(id);
  }

  // Lista usuários vinculados à company.
  // GET /companies/:id/users
  @Get(':id/users')
  findUsers(@Param('id') id: string) {
    return this.companiesService.findUsers(id);
  }

  // Atualiza campos da company. ownerId (se enviado) é mapeado para createdBy.
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  // Troca o owner/dono da company.
  // PATCH /companies/:id/owner  body: { ownerId }
  @Patch(':id/owner')
  changeOwner(@Param('id') id: string, @Body() dto: ChangeOwnerDto) {
    return this.companiesService.changeOwner(id, dto.ownerId);
  }

  // Soft delete: marca status = 'inactive'.
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.companiesService.remove(id);
  }

  // Adiciona/associa um usuário à company (atualiza user.companyId).
  // POST /companies/:id/users  body: { userId }
  @Post(':id/users')
  addUser(@Param('id') id: string, @Body() dto: AddUserDto) {
    return this.companiesService.addUser(id, dto.userId);
  }

  // Remove usuário da company (reassocia para company `_system`).
  // DELETE /companies/:id/users/:userId
  @Delete(':id/users/:userId')
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.companiesService.removeUser(id, userId);
  }

  // Reativa uma company (status -> 'active').
  @Post(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.companiesService.reactivate(id);
  }
}
