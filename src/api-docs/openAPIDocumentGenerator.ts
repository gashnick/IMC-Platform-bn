import { authenticationRegistry } from "@/routes/authentication/authenticationRouters";
import { cartRegistry } from "@/routes/cart/cartRouter";
import { productRegistry } from "@/routes/products/productRouter";
import { userRegistry } from "@/routes/users/userRouter";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([authenticationRegistry, userRegistry, productRegistry, cartRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
  });
}
