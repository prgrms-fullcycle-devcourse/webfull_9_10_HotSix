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
  getSocketIoSpecHtml() {
    return readFileSync(resolveDocsPath("socket-io-spec.html"), "utf8");
  }

  @Get("socket-io.md")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  getSocketIoSpecMarkdown() {
    return readFileSync(resolveDocsPath("socket-io-spec.md"), "utf8");
  }

  @Get("redis")
  @Header("Content-Type", "text/html; charset=utf-8")
  getRedisSpecHtml() {
    return readFileSync(resolveDocsPath("redis-spec.html"), "utf8");
  }

  @Get("redis.md")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  getRedisSpecMarkdown() {
    return readFileSync(resolveDocsPath("redis-spec.md"), "utf8");
  }
}
