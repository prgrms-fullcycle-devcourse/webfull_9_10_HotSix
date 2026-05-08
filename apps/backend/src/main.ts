import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // dto에 없는 필드 자동 제거
      forbidNonWhitelisted: true, // dto에 없는 필드 들어오면 에러
      transform: true, // 타입 자동 변환
    }),
  );

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();
