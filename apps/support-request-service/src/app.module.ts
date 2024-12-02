import { Module } from "@nestjs/common";
import { SupportRequestModule } from "./supportRequest/supportRequest.module";
import { SupportRequestTypeModule } from "./supportRequestType/supportRequestType.module";
import { SupportRequestDetailModule } from "./supportRequestDetail/supportRequestDetail.module";
import { OutBoxModule } from "./outBox/outBox.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SecretsManagerModule } from "./providers/secrets/secretsManager.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ServeStaticOptionsService } from "./serveStaticOptions.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [],
  imports: [
    SupportRequestModule,
    SupportRequestTypeModule,
    SupportRequestDetailModule,
    OutBoxModule,
    HealthModule,
    PrismaModule,
    SecretsManagerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
  ],
  providers: [],
})
export class AppModule {}
