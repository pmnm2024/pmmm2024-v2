import { Inject, Injectable, UnauthorizedException, forwardRef } from "@nestjs/common";
import { Credentials } from "./Credentials";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { UserInfo } from "./UserInfo";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) { }

  async validateUser(
    username: string,
    password: string
  ): Promise<UserInfo | null> {
    const user = await this.userService.user({
      where: { username },
    });
    if (user && (await this.passwordService.compare(password, user.password))) {
      const { id, roles } = user;
      const roleList = roles as string[];
      return { id, username, roles: roleList };
    }
    return null;
  }
  async login(credentials: Credentials): Promise<UserInfo> {
    const { username, password } = credentials;
    const user = await this.validateUser(
      credentials.username,
      credentials.password
    );
    if (!user) {
      throw new UnauthorizedException("The passed credentials are incorrect");
    }
    const accessToken = await this.createToken(user.id, username, password)
    return {
      accessToken,
      ...user,
    };
  }

  async createToken(id: string, username: string, password: string) {
    const accessToken = await this.tokenService.createToken({
      id: id,
      username,
      password,
      jti: `${id}_${Date.now()}`
    });
    return accessToken
  }

  async decodeToken(token: string) {
    const decode = await this.tokenService.decodeToken(token)
    return decode;
  }
}
