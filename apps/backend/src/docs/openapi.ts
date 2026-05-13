import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const createOpenApiDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Keyboard Warrior Battle Royale API")
    .setDescription("Keyboard Warrior Battle Royale backend API")
    .setVersion("1.0.0")
    .addCookieAuth("refreshToken", {
      type: "apiKey",
      in: "cookie",
    })
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
};

export const setupOpenApiDocs = (app: INestApplication) => {
  const document = createOpenApiDocument(app);

  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Keyboard Warrior Battle Royale API Docs",
    jsonDocumentUrl: "docs/openapi.json",
    yamlDocumentUrl: "docs/openapi.yaml",
    swaggerOptions: {
      deepLinking: true,
      docExpansion: "list",
      persistAuthorization: true,
    },
  });
};
