import { ConfigService } from "@nestjs/config";
import { RmqOptions, Transport } from "@nestjs/microservices";

export const generateRabbitMQClientOptions = (
  configService: ConfigService,
  topic?: string
): RmqOptions => {
  const RabbitMQUrlStrings = configService.get("RABBITMQ_URLS");

  if (!RabbitMQUrlStrings) {
    throw new Error("RABBITMQ_URLS environment variable must be defined");
  }

  return {
    transport: Transport.RMQ,
    options: {
      urls: [...RabbitMQUrlStrings.split(",")],
      queue: topic,
      queueOptions: {
        consumerGroupId: configService.get("RABBITMQ_SUBSCRIBE_GROUP"),
        noAssert: topic ? false : true, // If topic is not defined, then the queue is not created
        arguments: {
          'x-dead-letter-exchange': 'dlx_exchange',
          'x-dead-letter-routing-key': `dlx_${configService.get("RABBITMQ_SUBSCRIBE_GROUP")}`,
          'x-message-ttl': 60000,
          'x-max-retries': 5, 
        },
      },
    },
  };
};
