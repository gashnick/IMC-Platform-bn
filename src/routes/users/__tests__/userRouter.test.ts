import type { User } from "@/routes/users/userModel";
import { app } from "@/server";
import type { ServiceResponse } from "@/utils/serviceResponse";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";


describe("User API Endpoints", () => {
    const requestBodies = [
        {
            name: `Test User ${uuidv4()}`,
            email: `testuser-${uuidv4()}@example.com`,
            password: `securePassword${uuidv4()}`,
        },
        {
            name: `Test User ${uuidv4()}`,
            email: `testuser-${uuidv4()}@example.com`,
            password: `securePassword${uuidv4()}`,
        },
    ];
    let userId1 = "";
    let userId2 = "";
    let authCookie: string;

    // INSERT TEST USER
    beforeAll(async () => {
        let response;
        // Register the user and retrieve the auth cookie
        for (let requestBody of requestBodies) {
            response = await request(app)
                    .post("/register")
                    .send(requestBody) // Include the required request body
                    .set("Content-Type", "application/json"); // Ensure content type is set
            userId1 = response.body.responseObject?.id

            // Swapp variables to store both IDs
            let temp = userId2;
            userId2 = userId1;
            userId1= temp;
        }
        const result = response?.body;
        authCookie = response?.headers["set-cookie"] || ""; // Store the cookie from login

        expect(response?.statusCode).toEqual(StatusCodes.OK);  // Assertions
        expect(result.message).toEqual("Users registered successful!");
    });

    // GET ALL USERS
    describe("GET /users", () => {
        it("should return a list of users", async () => {
        // Act
        const response = await request(app).get("/users").set("Cookie", authCookie); // Include the httpOnly cookie

        const responseBody: ServiceResponse<User[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(responseBody.success).toBeTruthy();
        expect(responseBody.message).toContain("List of All Users");
        expect(responseBody.responseObject.length).toBeGreaterThan(0);
        });
    });

    // GET USER BY ID
    describe("GET /users/:id", () => {
        it("should return a user for a valid ID", async () => {
            const response = await request(app).get(`/users/${userId1}`).set("Cookie", authCookie);
            const responseBody: ServiceResponse<User> = response.body;

            // Assert
            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(responseBody.success).toBeTruthy();
            expect(responseBody.message).toContain("User details fetched!");
            compareUsers({ ...requestBodies[0], id: userId1 }, responseBody.responseObject);
        });

        it("should return a not found error for non-existent ID", async () => {
            const testId = "thisIsTestId"

            // Act
            const response = await request(app).get(`/users/${testId}`)
                                               .set("Cookie", authCookie);
            const responseBody: ServiceResponse<User> = response.body;

            // Assert
            expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(responseBody.success).toBeFalsy();
            expect(responseBody.message).toContain("No user found with that ID");
            expect(responseBody.responseObject).toBeNull();
        });
    });

    // UPDATE USER
    describe("PATCH /users/:update_id", () => {
        it("should updated user: name and email", async () => {
            const response = await request(app).patch(`/users/${userId1}`)
                                               .send({ name: requestBodies[0].name, email: requestBodies[0].email})
                                               .set("Cookie", authCookie);
            const responseBody: ServiceResponse<User> = response.body;

            // Assert
            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(responseBody.success).toBeTruthy();
            expect(responseBody.message).toContain("User details Updated!");
            compareUsers({ ...requestBodies[0], id: userId1 }, responseBody.responseObject);
        });

        it("should return a not found error for non-existent ID", async () => {
            const testId = "thisIsTestId"

            // Act
            const response = await request(app).patch(`/users/${testId}`)
                                               .send({ name: requestBodies[0].name, email: requestBodies[0].email})
                                               .set("Cookie", authCookie);

            const responseBody: ServiceResponse<User> = response.body;

            // Assert
            expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(responseBody.success).toBeFalsy();
            expect(responseBody.message).toContain("No user found with that ID");
            expect(responseBody.responseObject).toBeNull();
        });
    });

    // DELETE USER
    describe("DELETE /users/:delete_id", () => {
        it("should delete user - success", async () => {
            const response = await request(app)
                .delete(`/users/${ userId1 }`)
                .set("Content-Type", "application/json") // Ensure content type is set
                .set("Cookie", authCookie); // Include the cookie in the request

            const result = response.body;

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(result.success).toBeTruthy();
            expect(result.message).toEqual("User Deleted Successful!");
        });

        it("should return a No user found error for non-existent ID", async () => {
            const testId = "thisIsTestId"

            // Act
            const response = await request(app)
                .delete(`/users/${ testId }`)
                .set("Content-Type", "application/json") // Ensure content type is set
                .set("Cookie", authCookie); // Include the cookie in the request
            
            const responseBody: ServiceResponse<User> = response.body;

            // Assert
            expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(responseBody.success).toBeFalsy();
            expect(responseBody.message).toContain("No user found with that ID");
            expect(responseBody.responseObject).toBeNull();
        });
    });

    // CLEAR USER FROM DATABASE
    afterAll(async()=> {
        const response = await request(app)
            .delete(`/users/${ userId2 }`)
            .set("Content-Type", "application/json") // Ensure content type is set
            .set("Cookie", authCookie); // Include the cookie in the request

        const result = response.body;

        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(result.success).toBeTruthy();
        expect(result.message).toEqual("User Deleted Successful!");
    })
});

// Function to compare users
const compareUsers = (expected: User, actual: User) => {
    expect(actual.id).toEqual(expected.id);
    expect(actual.name).toEqual(expected.name);
    expect(actual.email).toEqual(expected.email);
};