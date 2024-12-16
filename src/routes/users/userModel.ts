import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;

export const UserSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(5, "Password must be at least 5 characters long").optional(),
    createdAt: z.date().optional(),
  })
  .openapi("User");

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
