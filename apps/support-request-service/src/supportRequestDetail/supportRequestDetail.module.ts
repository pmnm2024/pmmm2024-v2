import { Module } from "@nestjs/common";
import { SupportRequestDetailModuleBase } from "./base/supportRequestDetail.module.base";
import { SupportRequestDetailService } from "./supportRequestDetail.service";
import { SupportRequestDetailController } from "./supportRequestDetail.controller";

@Module({
  imports: [SupportRequestDetailModuleBase],
  controllers: [SupportRequestDetailController],
  providers: [SupportRequestDetailService],
  exports: [SupportRequestDetailService],
})
export class SupportRequestDetailModule {}
