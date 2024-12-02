import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { WarehouseService } from "./warehouse.service";
import { WarehouseControllerBase } from "./base/warehouse.controller.base";

@swagger.ApiTags("warehouses")
@common.Controller("warehouses")
export class WarehouseController extends WarehouseControllerBase {
  constructor(protected readonly service: WarehouseService) {
    super(service);
  }
}
