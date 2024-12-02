import { Module } from "@nestjs/common";
import { OutboxModuleBase } from "./base/outbox.module.base";
import { OutboxService } from "./outbox.service";
import { OutboxController } from "./outbox.controller";

@Module({
  imports: [OutboxModuleBase],
  controllers: [OutboxController],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
