import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const AuthUserId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user?: { id: string } }>();

  return request.user?.id;
});
