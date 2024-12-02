import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { DonationService } from "./donation.service";
import { DonationControllerBase } from "./base/donation.controller.base";

@swagger.ApiTags("donations")
@common.Controller("donations")
export class DonationController extends DonationControllerBase {
  constructor(protected readonly service: DonationService) {
    super(service);
  }
}
