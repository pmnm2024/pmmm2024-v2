import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SupportRequestDetailServiceBase } from "./base/supportRequestDetail.service.base";

@Injectable()
export class SupportRequestDetailService extends SupportRequestDetailServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
