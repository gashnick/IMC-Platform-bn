import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { productController } from "./productController";
import passport from "passport";
import { GetProductSchema, ProductSchema } from "./productModel";
import { upload } from "@/middleware/imagesUpload";

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

productRegistry.register("Product", ProductSchema);

//GET ALL
productRegistry.registerPath({                                    //Swagger Docs
    method: "get",
    path: "/products",
    tags: ["Products"],
    responses: createApiResponse(z.array(ProductSchema), "Success"),
});
productRouter.get("/", productController.getProducts);    // Product Route

//INSERT ONE
productRegistry.registerPath({
    method: "post",
    path: "/products",
    description: "This route is for inserting new product into database",
    tags: ["Products"],
    security:[{ CookieAuth: [] }],
    request: { body: createApiReqestBody(ProductSchema.omit({ id: true, createdAt: true, user: true }), "multipart/form-data") },
    responses: createApiResponse(ProductSchema, "Success"),
});
productRouter.post("/", Authenticate, upload.array("images"), productController.insertProduct);


//GET ONE
productRegistry.registerPath({
    method: "get",
    path: "/products/{id}",
    description: "This route is for getting product by ID",
    tags: ["Products"],
    request: { params: GetProductSchema.shape.params },
    responses: createApiResponse(ProductSchema, "Success"),
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
        body: createApiReqestBody(ProductSchema.omit({ id: true, createdAt: true, user: true }), "multipart/form-data"),
    },
    responses: createApiResponse(ProductSchema, "Success"),
});

productRouter.patch("/:update_id", Authenticate,upload.array("images"), productController.updateProduct);

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
    responses: createApiResponse(ProductSchema, "Success"),
});

productRouter.delete("/:delete_id", Authenticate, productController.deleteProduct);
