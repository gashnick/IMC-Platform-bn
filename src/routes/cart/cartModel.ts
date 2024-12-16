import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/utils/commonValidation";

extendZodWithOpenApi(z);

export type Cart = z.infer<typeof CartSchema>;

const CartStatusEnum = z.enum(["active", "pending", "completed"]);

// Cart Schema
export const CartSchema = z
  .object({
    status: CartStatusEnum,
    quantity: z.number().default(0.0),
    totalPrice: z.number().default(0.0),
    priceAtAddition: z.number().default(0.0),
    productId: z.string(),
  })
  .openapi("Cart");
