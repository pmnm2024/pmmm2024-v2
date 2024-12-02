import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { HistorySendMailService } from "./historySendMail.service";
import { HistorySendMailControllerBase } from "./base/historySendMail.controller.base";

@swagger.ApiTags("historySendMails")
@common.Controller("historySendMails")
export class HistorySendMailController extends HistorySendMailControllerBase {
  constructor(protected readonly service: HistorySendMailService) {
    super(service);
  }
}
