import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { UserService } from "./user.service";
import { UserControllerBase } from "./base/user.controller.base";
import { Public } from "src/decorators/public.decorator";
import { UserCreateInput } from "./base/UserCreateInput";
import { User } from "./base/User";

@swagger.ApiTags("users")
@common.Controller("users")
export class UserController extends UserControllerBase {
  constructor(
    protected readonly service: UserService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  @Public()
  @common.Post("/register")
  async register(@common.Body() data: UserCreateInput): Promise<User> {
    try {
      const payLoad = {
        data: {
          ...data,

          rank: data.rank
            ? {
              connect: data.rank,
            }
            : undefined,
        },
        select: {
          address: true,
          createdAt: true,
          email: true,
          firstName: true,
          id: true,
          lastName: true,
          phone: true,

          rank: {
            select: {
              id: true,
            },
          },

          roles: true,
          score: true,
          sex: true,
          updatedAt: true,
          username: true,
        },
      }

      return await this.service.createUser(payLoad)
    } catch (error) {
      throw error
    }
  }

  @Public()
  @common.Post("/forgot-password")
  async forgotPassword(@common.Body("email") email: string) {
    try {
      const result = await this.service.forgotPassword(email)
      return result
    } catch (error: any) {
      throw new common.HttpException(
        {
          status: error.status,
          error: error.message,
        },
        error.status || common.HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // @Public()
  @common.Post("/reset-password")
  async resetPassword(@common.Request() req: any, @common.Body("passwordNew") passwordNew: string) {
    try {
      const { id } = req.user
      const result = await this.service.resetPassword(id, passwordNew)
      return {
        message: "Reset password successfull"
      }
    } catch (error: any) {
      throw new common.HttpException(
        {
          status: error.status,
          error: error.message,
        },
        error.status || common.HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
