import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiReqestBody, createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { cartController } from "./cartController";
import passport from "passport";
import { CartSchema } from "./cartModel";

export const cartRegistry = new OpenAPIRegistry();
export const cartRouter: Router = express.Router();
const Authenticate = passport.authenticate(['jwt', 'google'], { session: false });

cartRegistry.registerComponent(
    'securitySchemes', 
    'CookieAuth', 
    {
      type: 'apiKey',
      in: 'cookie',
      name: 'auth_token'
    }
);

cartRegistry.register("Cart", CartSchema);

//GET ALL CART ITEMS BY USER ID
cartRegistry.registerPath({                                    //Swagger Docs
    method: "get",
    path: "/carts",
    tags: ["Carts"],
    description: "## This route get all cart items for logged in user.",
    security:[{ CookieAuth: [] }],
    responses: createApiResponse(z.array(CartSchema), "Success"),
});
cartRouter.get("/", Authenticate, cartController.getCarts);                  // Cart Route


//ADD CART ITEM
cartRegistry.registerPath({
    method: "post",
    path: "/carts",
    description: "# This route is for addding a product to cart by Logged In user.",
    tags: ["Carts"],
    security:[{ CookieAuth: [] }],
    request: { 
        body: createApiReqestBody(CartSchema, "application/json") 
    },
    responses: createApiResponse(CartSchema, "Success"),
});

cartRouter.post("/", Authenticate, cartController.addToCart);

// UPDATE CART QUANTITY
cartRegistry.registerPath({
    method: "patch",
    path: "/carts/{update_id}",
    description: "This route enable user to update cart quantity.",
    tags: ["Carts"],
    security:[{ CookieAuth: [] }],
    request: { 
        params: z.object({ update_id: z.number() }),
        body: createApiReqestBody(CartSchema.pick({ quantity: true }), "application/json"),
    },
    responses: createApiResponse(CartSchema, "Success"),
});

cartRouter.patch("/:update_id", Authenticate, cartController.updateCartQuantity);

// DELETE product
cartRegistry.registerPath({
    method: "delete",
    path: "/carts/{delete_id}",
    description: "This route is for Deleting Cart item by ID",
    tags: ["Carts"],
    security:[{ CookieAuth: [] }],
    request: { 
        params: z.object({ delete_id: z.number() }),
    },
    responses: createApiResponse(CartSchema, "Success"),
});

cartRouter.delete("/:delete_id", Authenticate, cartController.deleteCartItem);
