import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HistorySendMailServiceBase } from "./base/historySendMail.service.base";

@Injectable()
export class HistorySendMailService extends HistorySendMailServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
