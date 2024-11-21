import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/users/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { User } from "./userModel";

class UserController {
    public getUsers: RequestHandler = async (_req: Request, res: Response) => {
        const serviceResponse = await userService.findAll();
        return handleServiceResponse(serviceResponse, res);
    };

    public getUser: RequestHandler = async (req: Request, res: Response) => {
        const id = Number.parseInt(req.params.id as string, 10);
        const serviceResponse = await userService.findById(id);
        return handleServiceResponse(serviceResponse, res);
    };

    public getProfile: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse = ServiceResponse.success<User>("Retrieved User Profile", req.user as User);
        return handleServiceResponse(serviceResponse, res);
    };
}

export const userController = new UserController();
