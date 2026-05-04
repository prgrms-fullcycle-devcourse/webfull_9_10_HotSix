import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Controller, Get, Header, InternalServerErrorException } from "@nestjs/common";

const resolveDocsPath = (fileName: string) => {
  const candidates = [
    join(process.cwd(), "docs", fileName),
    join(process.cwd(), "apps", "backend", "docs", fileName),
  ];

  const matched = candidates.find((candidate) => existsSync(candidate));

  if (!matched) {
    throw new InternalServerErrorException(`Docs file not found: ${fileName}`);
  }

  return matched;
};

@Controller("docs")
export class DocsController {
  @Get()
  @Header("Content-Type", "text/html; charset=utf-8")
  getSwaggerUi() {
    return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Keyboard Warrior Battle Royale API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        background: #f8fafc;
      }

      .swagger-ui {
        background: #ffffff;
      }

      #swagger-ui {
        max-width: 1200px;
        margin: 0 auto;
        min-height: 100vh;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/docs/openapi.yaml",
        dom_id: "#swagger-ui",
        deepLinking: true,
        docExpansion: "list",
        persistAuthorization: true
      });
    </script>
  </body>
</html>`;
  }

  @Get("openapi.yaml")
  @Header("Content-Type", "application/yaml; charset=utf-8")
  getOpenApiDocument() {
    return readFileSync(resolveDocsPath("openapi.yaml"), "utf8");
  }

  @Get("requirements")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  getRequirements() {
    return readFileSync(resolveDocsPath("requirements.md"), "utf8");
  }

  @Get("erd")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  getErd() {
    return readFileSync(resolveDocsPath("erd.md"), "utf8");
  }

  @Get("socket-io")
  @Header("Content-Type", "text/html; charset=utf-8")
  getSocketIoSpec() {
    return readFileSync(resolveDocsPath("socket-io-spec.html"), "utf8");
  }

  @Get("socket-io.md")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  getSocketIoSpecMarkdown() {
    return readFileSync(resolveDocsPath("socket-io-spec.md"), "utf8");
  }
}
