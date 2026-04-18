import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateUserInput, LoginInput } from "@saas/types";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new HttpException("Email already in use", HttpStatus.CONFLICT);
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return { user, token: "mock-jwt-token" };
  }

  async login(data: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: "mock-jwt-token",
    };
  }
}
