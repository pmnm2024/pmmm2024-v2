import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { OutboxService } from "./outbox.service";
import { OutboxControllerBase } from "./base/outbox.controller.base";

@swagger.ApiTags("outboxes")
@common.Controller("outboxes")
export class OutboxController extends OutboxControllerBase {
  constructor(protected readonly service: OutboxService) {
    super(service);
  }
}
