import prisma from "@/config/prisma";
import { ServiceResponse } from "@/utils/serviceResponse";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorHandler, asyncCatch } from "../../middleware/errorHandler";
import type { User } from "./userModel";

class UserController {
    public getUsers: RequestHandler = asyncCatch(async (_req: Request, res: Response, next: NextFunction) => {
        const users = await prisma.user.findMany({
        select: {
            name: true,
            email: true,
            createdAt: true,
            id: true,
        },
        });

        if (!users || users.length === 0) {
            return next(ErrorHandler.NotFound("No Users found"));
        }

        return ServiceResponse.success<User[]>("List of All Users", users, res);
    });

    public getUser: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                name: true,
                email: true,
                createdAt: true,
                id: true,
            },
        });
        if (!user) {
            return next(ErrorHandler.NotFound("No user found with that ID"));
        }

        return ServiceResponse.success<User>("User details fetched!", user, res);
    });

    public getProfile: RequestHandler = async (req: Request, res: Response) => {
        return ServiceResponse.success<User>("Retrieved User Profile", req.user as User, res);
    };

    public updateUser: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { update_id: id } = req.params;

        const existingUser = await prisma.user.findUnique({where: { id }})

        if (!existingUser) {
            return next(ErrorHandler.NotFound("No user found with that ID"));
        }

        const user = await prisma.user.update({
        where: { id },
        data: { ...req.body, password: undefined },
        select: {
            name: true,
            email: true,
            createdAt: true,
            id: true,
        },
        });

        return ServiceResponse.success<User>("User details Updated!", user, res);
    });

    public deleteUser: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { delete_id } = req.params;

        const user = await prisma.user.findUnique({ where: { id: delete_id } });
        
        if (!user) {
            return next(ErrorHandler.NotFound("No user found with that ID"));
        }

        await prisma.user.delete({ where: { id: delete_id } });

        return ServiceResponse.success("User Deleted Successful!", null, res, StatusCodes.OK);
    });
}

export const userController = new UserController();
