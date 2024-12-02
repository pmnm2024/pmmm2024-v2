import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutboxServiceBase } from "./base/outbox.service.base";

@Injectable()
export class OutboxService extends OutboxServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
