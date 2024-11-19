import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { authenticationService } from "./authenticationService";
import { User } from "../users/userModel";
import { getHash } from "@/common/utils/bcrypt";

class AuthenticationController {
    public registerUser: RequestHandler = async (_req: Request, res: Response) => {

        const hashedPassword = await getHash(_req.body.password);

        const user: User = {
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
}

export const aunthenticationController = new AuthenticationController();
