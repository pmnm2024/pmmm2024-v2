import { Module } from "@nestjs/common";
import { HistorySendMailModuleBase } from "./base/historySendMail.module.base";
import { HistorySendMailService } from "./historySendMail.service";
import { HistorySendMailController } from "./historySendMail.controller";

@Module({
  imports: [HistorySendMailModuleBase],
  controllers: [HistorySendMailController],
  providers: [HistorySendMailService],
  exports: [HistorySendMailService],
})
export class HistorySendMailModule {}
