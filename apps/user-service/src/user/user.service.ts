import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "../auth/password.service";
import { UserServiceBase } from "./base/user.service.base";
import { RabbitMQProducerService } from "src/rabbitmq/rabbitmq.producer.service";
import { Prisma, User } from "@prisma/client";
import { ResetPasswordOutput } from "./ResetPasswordOutput";
import { MyMessageBrokerTopics } from "src/rabbitmq/topics";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserService extends UserServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    protected readonly rabbitProducer: RabbitMQProducerService,
    protected configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super(prisma, passwordService);
  }

  /**
   * Service method to create a new user.
   *
   * @param {Prisma.UserCreateArgs} args - Arguments to create a new user, containing user data like email and password.
   * @returns {Promise<User>} The created user object.
   * @throws {BadRequestException} If the email or password is missing or if the email already exists in the database.
   */
  async createUser(args: Prisma.UserCreateArgs): Promise<User> {
    if (!args.data.email || !args) {
      throw new Error("Please fill full");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: args.data.email }, // Assuming 'email' is unique
    });

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const createdUser = await this.prisma.user.create({
      ...args,

      data: {
        ...args.data,
        password: await this.passwordService.hash(args.data.password),
      },
    });

    // Prepare and return the output
    return createdUser;
  }

  /**
   * Initiates the password reset process for a user by generating a reset token and sending it via email.
   *
   * This method performs the following actions:
   * 1. Validates if the email is provided.
   * 2. Checks if the user with the provided email exists in the database.
   * 3. Generates a token for password reset using the AuthService.
   * 4. Saves the token in cache with a TTL of 5 minutes.
   * 5. Sends an email containing the password reset link.
   *
   * @param {string} email - The email address of the user requesting a password reset.
   * @returns {Promise<ResetPasswordOutput>} A response object confirming the password reset request.
   * @throws {BadRequestException} If the email is missing or the user is not found in the system.
   */
  async forgotPassword(email: string): Promise<ResetPasswordOutput> {
    try {
      if (!email) {
        throw new BadRequestException("Email is required");
      }

      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const genateToken = await this.authService.createToken(
        user.id,
        user.username,
        user.password
      );

      const ttl = 300000; // 5 minute
      await this.cacheManager.set(`auth-token:${user.id}`, genateToken, ttl);

      const urlForgot = `${this.configService.get(
        "URL_SERVICE"
      )}/api/user/reset-password`;

      await this.prisma.$transaction([
        this.prisma.outBox.create({
          data: {
            eventType: MyMessageBrokerTopics.ResetPassword,
            payload: {
              userId: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              description: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    padding: 20px;
                  }
                  .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                    color: #333;
                    font-size: 24px;
                  }
                  p {
                    font-size: 16px;
                    margin-bottom: 20px;
                  }
                  .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                  }
                  .button:hover {
                    background-color: #0056b3;
                  }
                  .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888;
                    margin-top: 40px;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                  <h1>Password Reset Request</h1>
                  <p>Hello ${user.firstName} ${user.lastName},</p>
                  <p>We received a request to reset your password for your account. If you didn't make this request, you can safely ignore this email.</p>
                  <p>To reset your password, please click the button below:</p>
                  <a href=${urlForgot} class="button">Reset Password</a>
                  <p>This link will expire in 24 hours for security purposes. If you do not reset your password within this time, you will need to request a new password reset.</p>
                  <div class="footer">
                    <p>If you did not request a password reset, please ignore this message or contact support if you have questions.</p>
                  </div>
                </div>
              </body>
              </html>`,
            },
            retry: 3,
            status: "pending",
          },
        }),
      ]);

      return {
        success: true,
        message: "Forgot password success",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resets the user's password by validating the token and updating the password in the database.
   *
   * This method performs the following actions:
   * 1. Validates the provided `userId` to ensure it is present.
   * 2. Retrieves the stored reset token from cache.
   * 3. Verifies if the token is valid and not expired.
   * 4. Fetches the user details from the database.
   * 5. Decodes the reset token and invalidates it (by adding it to the blacklist).
   * 6. Hashes the new password and updates it in the database.
   * 7. Removes the reset token from the cache.
   *
   * @param {string} userId - The ID of the user requesting to reset their password.
   * @param {string} passwordNew - The new password provided by the user.
   * @returns {Promise<void>} A promise that resolves once the password has been successfully updated.
   * @throws {BadRequestException} If the `userId` is invalid, the token is expired/invalid, or the user is not found.
   */
  async resetPassword(userId: string, passwordNew: string): Promise<void> {
    try {
      if (!userId) {
        throw new BadRequestException("Hackerr!!!");
      }
      const storedToken = await this.cacheManager.get<string>(
        `auth-token:${userId}`
      );

      if (!storedToken) {
        throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
      }

      const userCheck = await this.user({
        where: { id: userId },
        select: {
          address: true,
          createdAt: true,
          email: true,
          firstName: true,
          id: true,
          lastName: true,
          phone: true,
          roles: true,
          sex: true,
          updatedAt: true,
          username: true,
        },
      });

      if (!userCheck) {
        throw new BadRequestException("User not found");
      }
      const decodedToken = (await this.authService.decodeToken(
        storedToken
      )) as any;
      await this.cacheManager.set(
        `blacklist:${decodedToken.jti}`,
        true,
        60 * 60 * 24
      );

      const password = await this.passwordService.hash(passwordNew);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password,
        },
      });
      await this.cacheManager.del(`auth-token:${userId}`);

      return;
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Something went wrong during password reset"
      );
    }
  }

  /**
   * Increments the user's score (points) by updating the `score` field in the database.
   *
   * This method performs the following actions:
   * 1. Validates the provided `userId` and `points` parameters to ensure they are not null or undefined.
   * 2. Retrieves the user from the database based on the `userId`.
   * 3. If the user is found, updates the user's score with the provided `points` value.
   * 4. Returns the updated user data.
   *
   * @param {string} userId - The ID of the user whose points are being updated.
   * @param {number} points - The points to be added to the user's current score.
   * @returns {Promise<User>} The updated user object with the new score.
   * @throws {BadRequestException} If the `userId` or `points` are not provided or if the user is not found in the database.
   */
  async plusPotins(userId: string, points: number): Promise<User> {
    try {
      if (!userId) throw new BadRequestException("User is require");

      if (!points) throw new BadRequestException("Points is require");

      const user = await this.user({
        where: { id: userId },
        select: {
          address: true,
          createdAt: true,
          email: true,
          firstName: true,
          id: true,
          lastName: true,
          phone: true,
          roles: true,
          sex: true,
          updatedAt: true,
          username: true,
          rank: true,
          rankId: true,
          score: true,
        },
      });

      if (!user) throw new BadRequestException("User not found");

      return await this.updateUser({
        where: { id: userId },
        data: {
          score: user.score ?? 0 + points,
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
      });
    } catch (error) {
      throw error;
    }
  }

  /**
 * Decrements the user's score by the provided `points` value and updates the user in the database.
 * 
 * This method performs the following actions:
 * 1. Validates the provided `userId` and `points` to ensure they are present.
 * 2. Retrieves the user from the database using the `userId`.
 * 3. If the user is found, decreases the user's score by the specified `points` value.
 * 4. Returns the updated user object with the new score.
 * 
 * @param {string} userId - The ID of the user whose score is to be decreased.
 * @param {number} points - The number of points to subtract from the user's score.
 * @returns {Promise<User>} The updated user object with the new score and other user details.
 * @throws {BadRequestException} If the `userId` or `points` are not provided, or if the user is not found in the database.
 */
  async minusPoints(userId: string, points: number): Promise<User> {
    try {
      if (!userId) throw new BadRequestException("User is required");
      if (!points) throw new BadRequestException("Points are required");

      const user = await this.user({
        where: { id: userId },
        select: {
          address: true,
          createdAt: true,
          email: true,
          firstName: true,
          id: true,
          lastName: true,
          phone: true,
          roles: true,
          sex: true,
          updatedAt: true,
          username: true,
          rank: true,
          rankId: true,
          score: true,
        },
      });

      if (!user) throw new BadRequestException("User not found");

      let newScore = 0;

      if (user.score) {
        newScore = user.score - points;
      }

      return await this.updateUser({
        where: { id: userId },
        data: {
          score: newScore,
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
      });
    } catch (error) {
      throw error;
    }
  }
}
