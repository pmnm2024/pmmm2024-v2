import { Module } from "@nestjs/common";
import { OutBoxModuleBase } from "./base/outBox.module.base";
import { OutBoxService } from "./outBox.service";
import { OutBoxController } from "./outBox.controller";

@Module({
  imports: [OutBoxModuleBase],
  controllers: [OutBoxController],
  providers: [OutBoxService],
  exports: [OutBoxService],
})
export class OutBoxModule {}
