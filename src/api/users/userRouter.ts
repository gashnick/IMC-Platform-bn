import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema } from "@/api/users/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import passport from "passport";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.registerComponent(
    'securitySchemes', 
    'CookieAuth', 
    {
      type: 'apiKey',
      in: 'cookie',
      name: 'auth_token'
    }
);

userRegistry.register("User", UserSchema);

//GET ALL
userRegistry.registerPath({
    method: "get",
    path: "/users",
    tags: ["Users"],
    security:[{ CookieAuth: [] }],
    responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", passport.authenticate("jwt", { session: false }), userController.getUsers);

//GET LOGGED USER PROFILE
userRegistry.registerPath({
    method: "get",
    path: "/users/profile",
    tags: ["Users"],
    security:[{ CookieAuth: [] }],
    responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/profile", passport.authenticate("jwt", { session: false }), userController.getProfile);

//GET ONE
userRegistry.registerPath({
    method: "get",
    path: "/users/{id}",
    tags: ["Users"],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
