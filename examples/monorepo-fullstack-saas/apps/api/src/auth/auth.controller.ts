import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { createUserSchema, loginSchema } from "@saas/types";
import { ZodError } from "zod";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: unknown) {
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpException(
        { message: "Validation failed", errors: parsed.error.format() },
        HttpStatus.BAD_REQUEST
      );
    }
    return this.authService.register(parsed.data);
  }

  @Post("login")
  async login(@Body() body: unknown) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpException(
        { message: "Validation failed", errors: parsed.error.format() },
        HttpStatus.BAD_REQUEST
      );
    }
    return this.authService.login(parsed.data);
  }
}
