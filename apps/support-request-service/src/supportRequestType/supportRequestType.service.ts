import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SupportRequestTypeServiceBase } from "./base/supportRequestType.service.base";

@Injectable()
export class SupportRequestTypeService extends SupportRequestTypeServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
