import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import prisma from "@/common/utils/prisma";
import { comparePassword } from "@/common/utils/bcrypt";
import { attachToken } from "@/common/utils/token";
import { User } from "../users/userModel";

export class AuthenticationService {

    // Register new users
    async createUser(body: User): Promise<ServiceResponse<User | null>> {
        try {
            const user = await prisma.user.create({ 
                data: body,
                omit: {
                    password: true
                }
            })

            return ServiceResponse.success<User>("Users registered successful!", attachToken(user));

        } catch (ex) {
            const errorMessage = `Error registering user: $${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while registering user.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Signin users
    async creadentialLogin(email: string, password: string): Promise<ServiceResponse<User | null>> {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email},
            });
    
            if(!user)
                return ServiceResponse.failure("Invalid email or Password!", null, StatusCodes.UNPROCESSABLE_ENTITY);
    
    
            // check if password match also
            const isMatch = await comparePassword(password, user.password!);
            
            if(!isMatch)
                return ServiceResponse.failure("Invalid email or Password!", null, StatusCodes.UNPROCESSABLE_ENTITY);
    
            
            return  ServiceResponse.success<User>("User Log IN successful!", attachToken({
                        name: user.name,
                        email: user.email,
                        id: user.id,
                        createdAt: user.createdAt
                    }));

        } catch (error) {
            const errorMessage = `Error Logging in USER:, ${(error as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while trying to login.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const authenticationService = new AuthenticationService();
