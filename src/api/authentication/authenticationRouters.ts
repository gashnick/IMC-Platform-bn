import { OpenAPIRegistry, ZodRequestBody } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { aunthenticationController } from "./authenticationController";
import { UserSchema } from "../users/userModel";
import { StatusCodes } from "http-status-codes";
import passport from "passport";

export const regiserRegistry = new OpenAPIRegistry();
export const authenticationRouters: Router = express.Router();

//REGISTRACTION
regiserRegistry.registerPath({
    method: "post",
    path: "/register",
    request: {
        body: createApiReqestBody(UserSchema.omit({ id: true }))
    }, 
    tags: ["Authentication"],
    responses: createApiResponse(UserSchema, "User registered successfully", StatusCodes.OK),
});
authenticationRouters.post("/register",  aunthenticationController.registerUser);

//LOGIN WITH CREDENTIALS
regiserRegistry.registerPath({
    method: "post",
    path: "/credentialsLogin",
    tags: ["Authentication"],
    request: {
        body: createApiReqestBody(UserSchema.omit({ id: true,name: true }))
    }, 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.post("/credentialsLogin", aunthenticationController.loginUser);

//LOGIN WITH GOOGLE
regiserRegistry.registerPath({
    method: "post",
    path: "/googleLogin",
    tags: ["Authentication"],
    request: {
        body: createApiReqestBody(UserSchema.omit({ id: true,name: true }))
    }, 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.post("/googleLogin", aunthenticationController.loginUser);