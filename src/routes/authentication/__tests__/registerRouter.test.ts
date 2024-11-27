import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

import type { ServiceResponse } from "@/utils/serviceResponse";
import { app } from "@/server";

// REGISTER ENDPOINT
describe("Register API endpoints", () => {
    it("POST /register - success", async () => {
        const uniqueId = uuidv4(); // Generate a unique ID
        const requestBody = {
            name: `Test User ${uniqueId}`,
            email: `testuser-${uniqueId}@example.com`,
            password: `securePassword${uniqueId}`
          };
  
      const response = await request(app)
        .post("/register")
        .send(requestBody) // Include the required request body
        .set("Content-Type", "application/json"); // Ensure content type is set
  
      const result: ServiceResponse = response.body;
  
      // Assertions
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual("Users registered successful!");
      expect(result.responseObject).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: requestBody.email,
          name: requestBody.name,
          createdAt: expect.any(String),
        })
      );
    });
  });
