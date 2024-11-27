import type { Request, RequestHandler, Response } from "express";
import { User } from "../users/userModel";
import { comparePassword, getHash } from "@/utils/bcrypt";
import { StatusCodes } from "http-status-codes";
import { NextFunction } from 'express';
import { attachCookie, generateVerificationCode } from "@/utils/token";
import { ServiceResponse } from "@/utils/serviceResponse";
import prisma from "@/utils/prisma";
import { asyncCatch, ErrorHandler } from '../../middleware/errorHandler';
import { forgotPasswordEmailTemplate, sendEmail } from "@/utils/email";

class AuthenticationController {

    public registerUser: RequestHandler = asyncCatch(async (_req: Request, res: Response) => {
        const hashedPassword = await getHash(_req.body.password);
        const{ name, email} = _req.body;

        const user = await prisma.user.create({ 
            data: { name, email, password: hashedPassword },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        })

        // Attach token Cookies
        attachCookie(user.id, res);
        return ServiceResponse.success<User>("Users registered successful!", user, res);
    });

    public loginUser: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: email},
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                createdAt: true
            }
        });

        if(!user)
            return next(ErrorHandler.BadRequest("Invalid email or Password!"));


        // check if password match also
        const isMatch = await comparePassword(password, user.password!);
        
        if(!isMatch)
            return next(ErrorHandler.BadRequest("Invalid email or Password!"));

        // Attach token Cookies
        attachCookie(user.id!, res)
        
        return  ServiceResponse.success<User>(
                "User Log IN successful!", 
                { ...user,  password: undefined },
                res
        );
    });

    public googleLogin: RequestHandler = asyncCatch( async (req: Request, res: Response) => {
            
            attachCookie((req?.user as User).id!, res);

            return res.redirect(process.env.FRONTED_REDIRECT || "/")
    });

    public userLogout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        res.cookie("auth_token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        });

        return ServiceResponse.success("User Logout successful!", null, res);
    };

    public forgotPassword: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        //getting user information
        const user = await prisma.user.findUnique({where: { email }});

        if(!user){
            return next(ErrorHandler.NotFound("Provided User Email Doesn't match Any in Database"));
        }

        //Generate Reset Codes
        const resetCode = generateVerificationCode();
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordCode: resetCode,
                resetPasswordExpires: Date.now() + 30 * 60 * 1000,
            }
        });

        const emailMessage = forgotPasswordEmailTemplate(user?.name, resetCode);
        
        try {
            await sendEmail(
                email as string,
                "Password Recovery from IMC Ltd",
                emailMessage,
            );

            return ServiceResponse.success(`Email sent to: ${ user?.name }`, null, res);
        
        } catch (error) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordCode: null,
                    resetPasswordExpires: null,
                }
            });
            return next(ErrorHandler.InternalServerError((error as Error)?.message || "Something went wrong while sending email!"));
        }
    });

    public resetPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        const { password, confirmPassword } = req.body;
        const { resetCode } = req.params;

        const user = await prisma.user.findFirst({
            where: { 
                resetPasswordCode: Number(resetCode),
                resetPasswordExpires: { gt: Date.now() }
            }
        });

        if(!user){
            return next(ErrorHandler.BadRequest("Password reset code is invalid or has expired"));
        }

        try {

            if(password !== confirmPassword){
                return next(ErrorHandler.BadRequest("Password does not match!"));
            }

            const newPassword = await getHash(password);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordCode: null,
                    resetPasswordExpires: null,
                    password: newPassword
                }
            });

            return ServiceResponse.success(`Password Reset Successful you can login now`, null, res, StatusCodes.OK);
        
        } catch (error) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordCode: null,
                    resetPasswordExpires: null,
                }
            });
            return next(ErrorHandler.InternalServerError((error as Error)?.message || "Something went wrong while Reseting Password!"));
        }
    };
}

export const aunthenticationController = new AuthenticationController();
