import { OpenAPIRegistry, ZodRequestBody } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { aunthenticationController } from "./authenticationController";
import { UserSchema } from "../users/userModel";
import { StatusCodes } from "http-status-codes";

export const regiserRegistry = new OpenAPIRegistry();
export const authenticationRouters: Router = express.Router();

//REGISTRACTION
regiserRegistry.registerPath({
    method: "post",
    path: "/register",
    request: {
        body: createApiReqestBody(UserSchema)
    }, 
    tags: ["Authentication"],
    responses: createApiResponse(UserSchema, "User registered successfully", StatusCodes.OK),
});

authenticationRouters.post("/register",  aunthenticationController.registerUser);

//LOGIN
regiserRegistry.registerPath({
    method: "post",
    path: "/login",
    tags: ["Authentication"],
    responses: createApiResponse(z.null(), "Success"),
});

authenticationRouters.post("/login", (_req: Request, res: Response) => {
    const serviceResponse = ServiceResponse.success("Service is healthy", null);
    return handleServiceResponse(serviceResponse, res);
});