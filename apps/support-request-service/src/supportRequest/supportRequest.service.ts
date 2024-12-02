import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SupportRequestServiceBase } from "./base/supportRequest.service.base";

@Injectable()
export class SupportRequestService extends SupportRequestServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
