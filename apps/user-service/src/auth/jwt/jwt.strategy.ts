import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JWT_SECRET_KEY_PROVIDER_NAME } from "../../constants";
import { JwtStrategyBase } from "./base/jwt.strategy.base";
import { UserService } from "../../user/user.service";
import { UserInfo } from "../UserInfo";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class JwtStrategy extends JwtStrategyBase {
  constructor(
    @Inject(JWT_SECRET_KEY_PROVIDER_NAME) secretOrKey: string,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    protected readonly userService: UserService
  ) {
    super(secretOrKey, userService);
  }

  async validate(payload: any): Promise<UserInfo> {
    const { jti, username } = payload
    const isBlacklisted = await this.cacheManager.get(`blacklist:${jti}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token đã bị vô hiệu hóa');
    }
    const user = await this.userService.user({
      where: { username },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (
      !Array.isArray(user.roles) ||
      typeof user.roles !== "object" ||
      user.roles === null
    ) {
      throw new Error("User roles is not a valid value");
    }
    return { ...user, roles: user.roles as string[] };
  }
}
