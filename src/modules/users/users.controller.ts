import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Cria um novo usuário.
  // Body exemplo: { fullName, email, password, roleId?, companyId? }
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Lista todos os usuários.
  // GET /users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Retorna o perfil do usuário logado.
  // GET /users/me
  @Get("me")
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  // Busca usuário por ID.
  // GET /users/:id
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  // Atualiza campos do usuário.
  // PATCH /users/:id
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Remove um usuário (Hard Delete).
  // DELETE /users/:id
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
