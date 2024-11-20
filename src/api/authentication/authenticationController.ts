import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { authenticationService } from "./authenticationService";
import { User } from "../users/userModel";
import { getHash } from "@/common/utils/bcrypt";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { NextFunction } from 'express';

class AuthenticationController {
    public registerUser: RequestHandler = async (_req: Request, res: Response) => {

        const hashedPassword = await getHash(_req.body.password);

        const user = {
            name: _req.body.name,
            email: _req.body.email,
            password: hashedPassword
        }

        const serviceResponse = await authenticationService.createUser(user);
      
        return handleServiceResponse(serviceResponse, res);
    };

    public loginUser: RequestHandler = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const serviceResponse = await authenticationService.creadentialLogin(email, password);
        return handleServiceResponse(serviceResponse, res);
    };

    public googleLogin: RequestHandler = async (req: Request, res: Response) => {
        try {
            const serviceResponse =  ServiceResponse.success<User>("User Log IN successful!", req.user as User);
            return handleServiceResponse(serviceResponse, res);
        } catch (error) {
            return ServiceResponse.failure("User Login Failed!", StatusCodes.UNPROCESSABLE_ENTITY);
        }
    };

    public googleLogout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.logout(function(err) {
                if (err) { return next(err); }
            });
        } catch (error) {
            return ServiceResponse.failure("User Login Failed!", StatusCodes.UNPROCESSABLE_ENTITY);
        }
    };
}

export const aunthenticationController = new AuthenticationController();
