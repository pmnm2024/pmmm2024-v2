import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { SupportRequestDetailService } from "./supportRequestDetail.service";
import { SupportRequestDetailControllerBase } from "./base/supportRequestDetail.controller.base";

@swagger.ApiTags("supportRequestDetails")
@common.Controller("supportRequestDetails")
export class SupportRequestDetailController extends SupportRequestDetailControllerBase {
  constructor(protected readonly service: SupportRequestDetailService) {
    super(service);
  }
}
