import { User } from "@prisma/client";
import jwt from "jsonwebtoken"

export const attachToken = (user: User)=>{

    if (! process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set!");
    }

    //create jwt token
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });

    return {
        token,
        user
    };
}