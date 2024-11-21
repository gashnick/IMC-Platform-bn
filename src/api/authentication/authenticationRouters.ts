import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
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
        body: createApiReqestBody(UserSchema.omit({ id: true, createdAt: true }))
    }, 
    tags: ["Authentication"],
    responses: createApiResponse(UserSchema, "User registered successfully", StatusCodes.OK),
});
authenticationRouters.post("/register",  aunthenticationController.registerUser);

//LOGIN WITH CREDENTIALS
regiserRegistry.registerPath({
    method: "post",
    path: "/credentials-login",
    description: `## After login, session-token will be automatically stored in your browser. You can use the following format to send it to request.
        const response = await fetch("{backend_url}/users/profile", {
            method: "GET",
            credentials: "include" // include this line to get your token sent on request
        });
        For other libraries like **Axios** refer to online documentations for how to send request with httpOnly Token
    `,
    tags: ["Authentication"],
    request: {
        body: createApiReqestBody(UserSchema.omit({ id: true,name: true, createdAt: true }))
    }, 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.post("/credentials-login", aunthenticationController.loginUser);


// LOGIN WITH GOOGLE
regiserRegistry.registerPath({
    method: "get",
    path: "/google-login",
    description: "*Paste in browser: http://localhost:8080/google-login*",
    tags: ["Authentication"],
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.get("/google-login", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
}));


regiserRegistry.registerPath({
    method: "get",
    path: "/auth/google/redirect",
    description: "*After Login with google response will come to this route*",
    tags: ["Authentication"], 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.get("/auth/google/redirect",  
                            passport.authenticate("google"), 
                                aunthenticationController.googleLogin);


// HANDLE FORGOT PASSWORD
regiserRegistry.registerPath({
    method: "post",
    path: "/forgot-password",
    tags: ["Authentication"], 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.post("/forgot-password", aunthenticationController.forgotPassword);


// LOGOUT USER AND CLEAR COOKIES                                
regiserRegistry.registerPath({
    method: "delete",
    path: "/logout",
    tags: ["Authentication"], 
    responses: createApiResponse(UserSchema, "Success"),
});

authenticationRouters.delete("/logout", aunthenticationController.userLogout);
