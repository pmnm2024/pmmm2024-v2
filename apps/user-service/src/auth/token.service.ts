import { ITokenPayload, ITokenService } from "./ITokenService";

import { TokenServiceBase } from "./base/token.service.base";
import { INVALID_PASSWORD_ERROR, INVALID_USERNAME_ERROR } from "./constants";

export class TokenService extends TokenServiceBase implements ITokenService {

    createToken({ id, username, password }: ITokenPayload): Promise<string> {
        if (!username) return Promise.reject(INVALID_USERNAME_ERROR);
        if (!password) return Promise.reject(INVALID_PASSWORD_ERROR);

        const payload = {
            sub: id,
            username,
            password,
            jti: `${id}-${Date.now()}`,
            key: 'test2024'
        };
        return this.jwtService.signAsync(payload);
    }
    decodeToken(token: string): any {
        try {
            return this.jwtService.decode(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
