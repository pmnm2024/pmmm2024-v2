import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RankUserServiceBase } from "./base/rankUser.service.base";

@Injectable()
export class RankUserService extends RankUserServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
