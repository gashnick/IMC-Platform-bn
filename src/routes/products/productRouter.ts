import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema } from "@/routes/users/userModel";
import { productController } from "./productController";
import passport from "passport";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();
const Authenticate = passport.authenticate(['jwt', 'google'], { session: false });

productRegistry.registerComponent(
    'securitySchemes', 
    'CookieAuth', 
    {
      type: 'apiKey',
      in: 'cookie',
      name: 'auth_token'
    }
);

productRegistry.register("Product", UserSchema);

//GET ALL
productRegistry.registerPath({                                    //Swagger Docs
    method: "get",
    path: "/products",
    tags: ["Products"],
    security:[{ CookieAuth: [] }],
    responses: createApiResponse(z.array(UserSchema), "Success"),
});
productRouter.get("/", productController.getProducts);    // Product Route


//GET ONE
productRegistry.registerPath({
    method: "get",
    path: "/products/{id}",
    description: "This route is for getting product by ID",
    tags: ["Products"],
    security:[{ CookieAuth: [] }],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, "Success"),
});
productRouter.get("/:id", productController.getProduct);

// UPDATE PRODUCT
productRegistry.registerPath({
    method: "patch",
    path: "/products/{update_id}",
    description: "This route is for getting user by ID",
    tags: ["Products"],
    security:[{ CookieAuth: [] }],
    request: { 
        params: z.object({ update_id: z.string() }),
        body: createApiReqestBody(UserSchema.pick({ email: true, name: true }))
    },
    responses: createApiResponse(UserSchema, "Success"),
});

productRouter.patch("/:update_id", Authenticate, productController.updateProduct);

// DELETE product
productRegistry.registerPath({
    method: "delete",
    path: "/products/{delete_id}",
    description: "This route is for Deleting Prodcut by ID",
    tags: ["Products"],
    security:[{ CookieAuth: [] }],
    request: { 
        params: z.object({ delete_id: z.string() }),
    },
    responses: createApiResponse(UserSchema, "Success"),
});

productRouter.delete("/:delete_id", Authenticate, productController.deleteProduct);
