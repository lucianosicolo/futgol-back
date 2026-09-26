import { Controller, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
}