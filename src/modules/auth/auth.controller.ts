import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("check-email")
  checkEmail(@Body("email") email: string) {
    return this.authService.checkEmail(email);
  }

  @Public()
  @Post("signup")
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post("signin")
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }
}
