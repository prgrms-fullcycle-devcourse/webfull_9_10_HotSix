import { plainToInstance } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, validateSync } from "class-validator";

export class EnvironmentVariables {
  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  ACCESS_TOKEN_TTL_SECONDS: number = 900;

  @IsNumber()
  @IsOptional()
  REFRESH_TOKEN_TTL_DAYS: number = 30;

  @IsString()
  @IsOptional()
  REDIS_URL: string = "redis://localhost:6379";

  @IsString()
  SUPABASE_URL!: string;

  @IsString()
  SUPABASE_SERVICE_ROLE_KEY!: string;

  @IsBoolean()
  @IsOptional()
  COOKIE_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN!: string;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
