import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { HealthModule } from "../src/modules/health/health.module";

describe("Health API", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health should return ok", async () => {
    await request(app.getHttpServer()).get("/health").expect(200).expect({
      status: "ok",
      service: "keyboard-warrior-backend",
    });
  });
});
