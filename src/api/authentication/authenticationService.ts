import { StatusCodes } from "http-status-codes";
import type { User } from "@/api/users/userModel";
import { UserRepository } from "@/api/users/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import prisma from "@/common/utils/prisma";

export class AuthenticationService {
    private userRepository: UserRepository;

    constructor(repository: UserRepository = new UserRepository()) {
        this.userRepository = repository;
    }

    // Retrieves all users from the database
    async createUser(body: User): Promise<ServiceResponse<User | null>> {
        try {
            const user = await prisma.user.create({
                data: body
            })

            return ServiceResponse.success<User>("Users found", user);

        } catch (ex) {
            const errorMessage = `Error creating user: $${(ex as Error).message}`;
            logger.error(errorMessage);
            console.log(ex)
            return ServiceResponse.failure(
                "An error occurred while adding user.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Retrieves a single user by their ID
    async findById(id: number): Promise<ServiceResponse<User | null>> {
        try {
            const user = await this.userRepository.findByIdAsync(id);
            if (!user) {
            return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<User>("User found", user);
        } catch (ex) {
            const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const authenticationService = new AuthenticationService();
