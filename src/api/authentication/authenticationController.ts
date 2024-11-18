import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { authenticationService } from "./authenticationService";
import { User } from "../users/userModel";

class AuthenticationController {
    public registerUser: RequestHandler = async (_req: Request, res: Response) => {
        const user: User = {
            name: _req.body.name,
            email: _req.body.email,
            password: _req.body.password
        }

        const serviceResponse = await authenticationService.createUser(user);
      
        return handleServiceResponse(serviceResponse, res);
    };

    public getUser: RequestHandler = async (req: Request, res: Response) => {
        const id = Number.parseInt(req.params.id as string, 10);
        const serviceResponse = await authenticationService.findById(id);
        return handleServiceResponse(serviceResponse, res);
    };
}

export const aunthenticationController = new AuthenticationController();
