import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { authenticationService } from "./authenticationService";
import { User } from "../users/userModel";
import { getHash } from "@/common/utils/bcrypt";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { NextFunction } from 'express';
import { attachCookie, attachToken } from "@/common/utils/token";

class AuthenticationController {
    public registerUser: RequestHandler = async (_req: Request, res: Response) => {

        const hashedPassword = await getHash(_req.body.password);

        const user = {
            name: _req.body.name,
            email: _req.body.email,
            password: hashedPassword
        }

        
        const serviceResponse = await authenticationService.createUser(user);

        // Attach token Cookies
        attachCookie(serviceResponse?.responseObject?.id!, res)
      
        return handleServiceResponse(serviceResponse, res);
    };

    public loginUser: RequestHandler = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const serviceResponse = await authenticationService.creadentialLogin(email, password);

        // Attach token Cookies
        attachCookie(serviceResponse?.responseObject?.id!, res)

        return handleServiceResponse(serviceResponse, res);
    };

    public googleLogin: RequestHandler = async (req: Request, res: Response) => {
        try {
            
            attachCookie((req?.user as User).id!, res);

            res.redirect(process.env.FRONTED_REDIRECT || "/")
        } catch (error) {
            return ServiceResponse.failure("User Login Failed!", StatusCodes.UNPROCESSABLE_ENTITY);
        }
    };

    public userLogout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
            res.cookie("auth_token",null,{
                expires:new Date(Date.now()),
                httpOnly:true
            });

            // req.logout(function(err) {
            //     if (err) { return next(err); }
            // });

            const logoutService = await authenticationService.logoutUser();

            return handleServiceResponse(logoutService, res);
    };

    public forgotPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

            const logoutService = await authenticationService.logoutUser();

            return handleServiceResponse(logoutService, res);
    };
}

export const aunthenticationController = new AuthenticationController();
