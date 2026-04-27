import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const AuthUserId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
  const userId = request.headers["x-user-id"];

  return userId ?? "demo-user-1";
});
