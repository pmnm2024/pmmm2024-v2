import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DonationServiceBase } from "./base/donation.service.base";

@Injectable()
export class DonationService extends DonationServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
