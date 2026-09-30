import { Controller, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import { Roles } from "src/Auth/roles.decorator";
import { RolesGuard } from "src/Auth/roles.guard";
import { UserRole } from "src/Users/user-role.enum";

@Controller('payments')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.ADMIN,
  UserRole.TEACHER,
)
export class PaymentsController {
}