import { Module } from "@nestjs/common";
import { SupportRequestTypeModuleBase } from "./base/supportRequestType.module.base";
import { SupportRequestTypeService } from "./supportRequestType.service";
import { SupportRequestTypeController } from "./supportRequestType.controller";

@Module({
  imports: [SupportRequestTypeModuleBase],
  controllers: [SupportRequestTypeController],
  providers: [SupportRequestTypeService],
  exports: [SupportRequestTypeService],
})
export class SupportRequestTypeModule {}
