import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { upload } from "@/middleware/imagesUpload";
import passport from "passport";
import { productController } from "./productController";
import { GetProductSchema, ProductFilters, ProductSchema } from "./productModel";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();
const Authenticate = passport.authenticate(["jwt", "google"], { session: false });

productRegistry.registerComponent("securitySchemes", "CookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "auth_token",
});

productRegistry.register("Product", ProductSchema);

//GET ALL
productRegistry.registerPath({
    //Swagger Docs
    method: "get",
    path: "/products",
    tags: ["Products"],
    responses: createApiResponse(z.array(ProductSchema), "Success"),
});
productRouter.get("/", productController.getProducts); // Product Route

// FILTER products
productRegistry.registerPath({
    method: "get",
    path: "/products/filter",
    description: `# Building Query for this route
        To build query for this route follow this guide lines
        1. Know that none of the attributes are required.
        2. When no filter is applied, route return all products
        3. Separate each query param with '&'
        4. Operators that could be used for fields with numbers like price or ratings: lte | gte | lt | gt where
                    . lte: Less than or equal
                    . gte: Greater than or equal
                    . lt : Less than
                    . gt : Greater than
        5. 'Keyword' is used to refer to the 'name of the product'
        
        Example:
        GET https://{backend-hostname}/products/filter?price[gte]=100&price[lte]=500&ratings[gte]=3&category=Cameras&productionType=Sell&location=Kigali
        `,
    request: {
        query: ProductFilters,
    },
    tags: ["Products"],
    responses: createApiResponse(ProductSchema, "Success"),
});

productRouter.get("/filter", productController.filterProducts);

//INSERT ONE
productRegistry.registerPath({
    method: "post",
    path: "/products",
    description: "This route is for inserting new product into database",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        body: createApiReqestBody(ProductSchema.omit({ id: true, createdAt: true, user: true }), "multipart/form-data"),
    },
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
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ update_id: z.string() }),
        body: createApiReqestBody(ProductSchema.omit({ id: true, createdAt: true, user: true }), "multipart/form-data"),
    },
    responses: createApiResponse(ProductSchema, "Success"),
});

productRouter.patch("/:update_id", Authenticate, upload.array("images"), productController.updateProduct);

// DELETE product
productRegistry.registerPath({
    method: "delete",
    path: "/products/{delete_id}",
    description: "This route is for Deleting Prodcut by ID",
    tags: ["Products"],
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ delete_id: z.string() }),
    },
    responses: createApiResponse(ProductSchema, "Success"),
});

productRouter.delete("/:delete_id", Authenticate, productController.deleteProduct);
