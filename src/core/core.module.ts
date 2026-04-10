import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TerminusModule } from "@nestjs/terminus";
import { APP_CONFIG_VALIDATION } from "./config/app.config";
import { TenancyMiddleware } from "./tenancy/tenancy.middleware";
import { HealthController } from "./health/health.controller";
import { LoggingInterceptor } from "./logging/logging.interceptor";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: APP_CONFIG_VALIDATION,
      envFilePath: ".env",
    }),
    EventEmitterModule.forRoot(),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes("*");
  }
}
