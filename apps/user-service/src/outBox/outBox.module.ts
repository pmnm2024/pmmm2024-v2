import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OutBoxModuleBase } from "./base/outBox.module.base";
import { OutBoxService } from "./outBox.service";
import { OutBoxController } from "./outBox.controller";

@Module({
  imports: [OutBoxModuleBase, forwardRef(() => AuthModule)],
  controllers: [OutBoxController],
  providers: [OutBoxService],
  exports: [OutBoxService],
})
export class OutBoxModule {}
