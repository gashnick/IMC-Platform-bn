import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/utils/commonValidation";


extendZodWithOpenApi(z);

export type Product = z.infer<typeof ProductSchema>;

// Enum for Category
export const CategoryEnum = z.enum([
    "Electronics",
    "Cameras",
    "Laptops",
    "Accessories",
    "Headphones",
    "Food",
    "Books",
    "Clothes_Shoes",
    "Beauty_Health",
    "Sports",
    "Outdoor",
    "Home",
]);

// Define a schema for uploaded files
const UploadedFileSchema = z.object({
    file: z.instanceof(File), // Ensure that the field is a file object
    fileName: z.string(),      // Optional: file name
    fileType: z.string(),      // Optional: MIME type
    fileSize: z.number(),      // Optional: size in bytes
  });

// Product Schema
export const ProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string().max(100).openapi({ description: "Product Name" }),
    price: z.number().min(0), // Use z.number for Decimal validation; adapt to custom if needed.
    description: z.string(),
    ratings: z.number().min(0).max(5).default(0), // Adjust range as per ratings logic.
    
    images: z.object({}).openapi({
            type:"array",
            items:{
                type:"string",
                format: "binary"
            }
    }).optional(),

    category: CategoryEnum,
    seller: z.string().openapi({ description: "Seller Name"}),
    stock: z.number().int().min(0).openapi({ description: "Product Quantity Available"}),
    user: z.string(),
    createdAt: z.date(),
}).openapi("Product");


// Input Validation for 'GET users/:id' endpoint
export const GetProductSchema = z.object({
    params: z.object({ id: commonValidations.id }),
});
