import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutBoxServiceBase } from "./base/outBox.service.base";

@Injectable()
export class OutBoxService extends OutBoxServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
