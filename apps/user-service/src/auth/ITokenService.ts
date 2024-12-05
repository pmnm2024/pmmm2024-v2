export interface ITokenPayload {
  id: string;
  username: string;
  password: string;
  jti: string;
}

export interface ITokenService {
  createToken: ({ id, username, password, jti }: ITokenPayload) => Promise<string>;
}
