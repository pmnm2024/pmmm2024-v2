import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutBoxServiceBase } from "./base/outBox.service.base";
import { RabbitMQProducerService } from "src/rabbitmq/rabbitmq.producer.service";
import { MyMessageBrokerTopics } from "src/rabbitmq/topics";

@Injectable()
export class OutBoxService extends OutBoxServiceBase {
  constructor(protected readonly prisma: PrismaService, protected readonly rabbitProducer: RabbitMQProducerService
  ) {
    super(prisma);
  }

  async processOutboxEvents() {
    const events = await this.prisma.outBox.findMany({ where: { status: 'pending' } });
    for (const event of events) {
      try {
        await this.rabbitProducer.emitMessage(event.eventType as MyMessageBrokerTopics, event.payload);

        await this.prisma.outBox.update({
          where: {
            id: event.id,  
          },
          data: {
            status: 'processed',          
            processedDate: new Date(),    
            retry: 0,                    
          },
        });
      } catch (error) {
        
        console.error(`Failed to send event ${event.id}:`, error);

        const retryCount = event.retry || 0;
        if (retryCount >= 3) {
          console.error(`Event ${event.id} reached max retry count.`);
          await this.prisma.outBox.update({
            where: { id: event.id },
            data: {
              status: 'failed',
              retry: retryCount + 1,
            },
          });
        } else {
          await this.prisma.outBox.update({
            where: { id: event.id },
            data: {
              retry: retryCount + 1,
            },
          });
        }
      }
    }
  }
}
