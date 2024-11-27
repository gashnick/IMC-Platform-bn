import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import compression from "compression";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { authenticationRouters } from "@/routes/authentication/authenticationRouters";
import { userRouter } from "@/routes/users/userRouter";
import errorHandler from "@/middleware/errorHandler";
import rateLimiter from "@/middleware/rateLimiter";
import requestLogger from "@/middleware/requestLogger";
import passport from "passport";
import { jwtAuthMiddleware } from "@/middleware/passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { googleAuthStrategy } from "./middleware/passport";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080"], credentials: true })); //env.CORS_ORIGIN, credentials: true
app.use(helmet());
app.use(compression());
app.use(rateLimiter);

// Convert bigInt to string
app.set('json replacer', (key: string, value: any) => {
    return typeof value === 'bigint' ? value.toString() : value;
});

// Configure session middleware
app.use(cookieParser(process.env.SESSION_SECRET || ""))

app.use(
    session({
      secret: process.env.SESSION_SECRET || "",
      resave: false,
      saveUninitialized: true,
    })
);

app.use(passport.initialize())
app.use(passport.session());

//Set UP strategies
jwtAuthMiddleware(passport)
googleAuthStrategy(passport)

// Request logging
app.use(requestLogger);


// Routes
app.use("/", authenticationRouters);
app.use("/users", userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
