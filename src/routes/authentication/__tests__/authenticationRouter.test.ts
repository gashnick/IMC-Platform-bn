import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "@/server";

// AUTHENTICATION ENDPOINTS
describe("Register API endpoints", () => {
    const uniqueId = uuidv4(); // Generate a unique ID
    const requestBody = {
        name: `Test User ${uniqueId}`,
        email: `testuser-${uniqueId}@example.com`,
        password: `securePassword${uniqueId}`,
    };
    let userId = "";
    let authCookie: string;

    // REGISTER USER
    it("POST /register - success", async () => {
        const response = await request(app)
            .post("/register")
            .send(requestBody) // Include the required request body
            .set("Content-Type", "application/json"); // Ensure content type is set

        const result = response.body;
        userId = result?.responseObject?.id;

        expect(response.statusCode).toEqual(StatusCodes.OK);  // Assertions
        expect(result.success).toBeTruthy();
        expect(result.message).toEqual("Users registered successful!");
        expect(result.responseObject).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                email: requestBody.email,
                name: requestBody.name,
                createdAt: expect.any(String),
            }),
        );
    });

    // LOGIN WITH CREDENTIALS
    it("POST /login - credentials - success", async () => {
        const response = await request(app)
            .post("/credentials-login")
            .send({
                email: requestBody.email,
                password: requestBody.password
            }) // Include the required request body
            .set("Content-Type", "application/json"); // Ensure content type is set

        const result = response.body;
        userId = result?.responseObject?.id;
        authCookie = response.headers["set-cookie"]; // Store the cookie from login

        expect(response.statusCode).toEqual(StatusCodes.OK);  // Assertions
        expect(result.success).toBeTruthy();
        expect(result.message).toEqual("User Log IN successful!");
        expect(result.responseObject).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                email: requestBody.email,
                name: requestBody.name,
                createdAt: expect.any(String),
            }),
        );
    });

    // LOGIN WITH GOOGLE
    describe("Google Login", () => {
        it("should redirect to Google login page", async () => {
            const response = await request(app).get("/google-login");
    
            // Simulate redirection to Google
            expect(response.status).toBe(302); // Redirect status
            expect(response.headers.location).toContain("accounts.google.com"); // Google OAuth URL
        });
    });

    // CLEAR USER FROM DATABASE
    afterAll(async()=> {
        const response = await request(app)
            .delete(`/users/${ userId }`)
            .set("Content-Type", "application/json") // Ensure content type is set
            .set("Cookie", authCookie); // Include the cookie in the request

        const result = response.body;

        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(result.success).toBeTruthy();
        expect(result.message).toEqual("User Deleted Successful!");
    })
});
