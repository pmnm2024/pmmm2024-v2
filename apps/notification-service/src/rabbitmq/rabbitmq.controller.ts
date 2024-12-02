import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { RabbitMQMessage } from "./RabbitMQMessage";
import { Controller, Logger } from "@nestjs/common";

@Controller("rabbitmq-controller")
export class RabbitMQController {
  private readonly logger = new Logger(RabbitMQController.name);

  @EventPattern("reset.password")
  async onResetPassword(
    @Payload()
    message: RabbitMQMessage,
    @Ctx()
    context: RmqContext
  ): Promise<void> {}

  @EventPattern("donate")
  async onDonate(
    @Payload()
    message: RabbitMQMessage,
    @Ctx()
    context: RmqContext
  ): Promise<void> {}
}
