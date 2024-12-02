import { Module } from "@nestjs/common";
import { DonationModuleBase } from "./base/donation.module.base";
import { DonationService } from "./donation.service";
import { DonationController } from "./donation.controller";

@Module({
  imports: [DonationModuleBase],
  controllers: [DonationController],
  providers: [DonationService],
  exports: [DonationService],
})
export class DonationModule {}
