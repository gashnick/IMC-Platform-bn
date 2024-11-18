import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { authenticationRouters } from "@/api/authentication/authenticationRouters";
import { userRouter } from "@/api/users/userRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import prisma from "./common/utils/prisma";
import passport from "passport";
import "@/common/utils/local-strategy";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);
app.use(passport.initialize())


app.get("/get-users", async(req,res)=>{
    const users = await prisma.user.findMany();

    res.status(200).json({
        status: "success",
        users
    })
})

// Routes
app.use("/", authenticationRouters);
app.use("/users", userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
