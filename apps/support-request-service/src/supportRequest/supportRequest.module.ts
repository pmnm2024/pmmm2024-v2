import { Module } from "@nestjs/common";
import { SupportRequestModuleBase } from "./base/supportRequest.module.base";
import { SupportRequestService } from "./supportRequest.service";
import { SupportRequestController } from "./supportRequest.controller";

@Module({
  imports: [SupportRequestModuleBase],
  controllers: [SupportRequestController],
  providers: [SupportRequestService],
  exports: [SupportRequestService],
})
export class SupportRequestModule {}
