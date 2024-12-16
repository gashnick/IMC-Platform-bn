import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema } from "@/routes/users/userModel";
import passport from "passport";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();
const Authenticate = passport.authenticate(["jwt", "google"], { session: false });

userRegistry.registerComponent("securitySchemes", "CookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "auth_token",
});

userRegistry.register("User", UserSchema);

//GET ALL
userRegistry.registerPath({
    method: "get",
    path: "/users",
    tags: ["Users"],
    security: [{ CookieAuth: [] }],
    responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", Authenticate, userController.getUsers);

//GET LOGGED USER PROFILE
userRegistry.registerPath({
    method: "get",
    path: "/users/profile",
    description: "*This route is for getting logged user profile information.*",
    tags: ["Users"],
    security: [{ CookieAuth: [] }],
    responses: createApiResponse(UserSchema, "Success"),
    });

userRouter.get("/profile", Authenticate, userController.getProfile);

//GET ONE
userRegistry.registerPath({
    method: "get",
    path: "/users/{id}",
    description: "This route is for getting user by ID",
    tags: ["Users"],
    security: [{ CookieAuth: [] }],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get("/:id", Authenticate, userController.getUser);

// UPDATE USER
userRegistry.registerPath({
    method: "patch",
    path: "/users/{update_id}",
    description: "This route is for getting user by ID",
    tags: ["Users"],
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ update_id: z.string() }),
        body: createApiReqestBody(UserSchema.pick({ email: true, name: true })),
    },
    responses: createApiResponse(UserSchema, "Success"),
});

userRouter.patch("/:update_id", Authenticate, userController.updateUser);

// DELETE USER
userRegistry.registerPath({
    method: "delete",
    path: "/users/{delete_id}",
    description: "This route is for getting Deleting user by ID",
    tags: ["Users"],
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ delete_id: z.string() }),
    },
    responses: createApiResponse(UserSchema, "Success"),
});

userRouter.delete("/:delete_id", Authenticate, userController.deleteUser);
