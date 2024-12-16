import dotenv from "dotenv";
import { cleanEnv, host, makeValidator, num, port, str, testOnly } from "envalid";

dotenv.config();

// Custom required validator
const requiredValidator = makeValidator((value) => {
  if (!value) {
    throw new Error("This·env·is·required!");
  }
  return value;
});

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  DATABASE_URL_LOCAL: requiredValidator(),
  JWT_SECRET: requiredValidator(),
  JWT_EXPIRES_TIME: requiredValidator(),
  SESSION_SECRET: requiredValidator(),
});
