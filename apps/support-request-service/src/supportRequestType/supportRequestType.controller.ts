import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { SupportRequestTypeService } from "./supportRequestType.service";
import { SupportRequestTypeControllerBase } from "./base/supportRequestType.controller.base";

@swagger.ApiTags("supportRequestTypes")
@common.Controller("supportRequestTypes")
export class SupportRequestTypeController extends SupportRequestTypeControllerBase {
  constructor(protected readonly service: SupportRequestTypeService) {
    super(service);
  }
}
