import type { User } from "@/routes/users/userModel";
import { app } from "@/server";
import type { ServiceResponse } from "@/utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

// Utility function to create mock users
// Utility function to create mock user
const createMockUser = () => ({
  name: `Test User ${uuidv4()}`,
  email: `testuser-${uuidv4()}@example.com`,
  password: "securePassword123",
});

// Function to compare users
const compareUsers = (expected: User, actual: User) => {
  expect(actual.id).toEqual(expected.id);
  expect(actual.name).toEqual(expected.name);
  expect(actual.email).toEqual(expected.email);
  expect(new Date(actual.createdAt || "").toISOString()).toEqual(new Date(expected.createdAt || "").toISOString());
};

describe("User API Endpoints", () => {
  let auth_token: string; // To store the authentication cookie
  const mockUser = createMockUser();

  beforeAll(async () => {
    // Register the user and retrieve the auth cookie
    const registerResponse = await request(app)
      .post("/register")
      .send(mockUser)
      .set("Content-Type", "application/json");

    expect(registerResponse.statusCode).toEqual(StatusCodes.OK);

    // Login the user to get the httpOnly cookie
    const loginResponse = await request(app)
      .post("/login")
      .send({
        email: mockUser.email,
        password: mockUser.password,
      })
      .set("Content-Type", "application/json");

    expect(loginResponse.statusCode).toEqual(StatusCodes.OK);

    // Extract cookie from the response headers
    auth_token = loginResponse.headers["set-cookie"].find((cookie: string) => cookie.startsWith("auth_token"));
    expect(auth_token).toBeDefined();
  });

  describe("GET /users", () => {
    it("should return a list of users", async () => {
      // Act
      const response = await request(app).get("/users").set("Cookie", auth_token); // Include the httpOnly cookie

      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("List of All Users");
      expect(responseBody.responseObject.length).toBeGreaterThan(0);
    });
  });

  // describe("GET /users/:id", () => {
  //     it("should return a user for a valid ID", async () => {
  //     // Arrange
  //     const testId = 1;
  //     const expectedUser = users.find((user) => user.id === testId) as User;

  //     // Act
  //     const response = await request(app).get(`/users/${testId}`);
  //     const responseBody: ServiceResponse<User> = response.body;

  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.OK);
  //     expect(responseBody.success).toBeTruthy();
  //     expect(responseBody.message).toContain("User found");
  //     if (!expectedUser) throw new Error("Invalid test data: expectedUser is undefined");
  //     compareUsers(expectedUser, responseBody.responseObject);
  //     });

  //     it("should return a not found error for non-existent ID", async () => {
  //     // Arrange
  //     const testId = Number.MAX_SAFE_INTEGER;

  //     // Act
  //     const response = await request(app).get(`/users/${testId}`);
  //     const responseBody: ServiceResponse = response.body;

  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  //     expect(responseBody.success).toBeFalsy();
  //     expect(responseBody.message).toContain("User not found");
  //     expect(responseBody.responseObject).toBeNull();
  //     });

  //     it("should return a bad request for invalid ID format", async () => {
  //     // Act
  //     const invalidInput = "abc";
  //     const response = await request(app).get(`/users/${invalidInput}`);
  //     const responseBody: ServiceResponse = response.body;

  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  //     expect(responseBody.success).toBeFalsy();
  //     expect(responseBody.message).toContain("Invalid input");
  //     expect(responseBody.responseObject).toBeNull();
  //     });
  // });
});

// function compareUsers(mockUser: User, responseUser: User) {
//   if (!mockUser || !responseUser) {
//     throw new Error("Invalid test data: mockUser or responseUser is undefined");
//   }

//   expect(responseUser.id).toEqual(mockUser.id);
//   expect(responseUser.name).toEqual(mockUser.name);
//   expect(responseUser.email).toEqual(mockUser.email);
//   expect(responseUser.age).toEqual(mockUser.age);
//   expect(new Date(responseUser.createdAt)).toEqual(mockUser.createdAt);
//   expect(new Date(responseUser.updatedAt)).toEqual(mockUser.updatedAt);
// }
