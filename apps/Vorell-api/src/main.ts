import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptors/login.Interceptor';
import {graphqlUploadExpress} from "graphql-upload"
import * as express from 'express'
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe)
  app.enableCors({origin:true, credentials:true})
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(graphqlUploadExpress({maxSize:15000000, maxFiles:10}))
  app.use("/uploads", express.static("./uploads"))
	app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
