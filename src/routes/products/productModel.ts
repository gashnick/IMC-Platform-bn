import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/utils/commonValidation";


extendZodWithOpenApi(z);

export type Product = z.infer<typeof ProductSchema>;

export const ProductSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.number(),
    description: z.string(),    
    ratings: z.number(),
    category: z.string(),
    seller: z.string(),
    stock: z.number(),
    numberOfReviews: z.number().optional(),
    userId : z.string(),
    createdAt: z.string().optional()
}).openapi("Product");


// Input Validation for 'GET users/:id' endpoint
export const GetProductSchema = z.object({
    params: z.object({ id: commonValidations.id }),
});
