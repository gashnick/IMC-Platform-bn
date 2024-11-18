import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { regiserRegistry } from "@/api/authentication/authenticationRouters";
import { userRegistry } from "@/api/users/userRouter";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([regiserRegistry, userRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Interface Multiservice Cooperation",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
  });
}
