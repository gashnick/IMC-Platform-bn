import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifyCallback } from "passport-jwt";
import { PassportStatic } from "passport";
import prisma from "@/common/utils/prisma";

export const jwtAuthMiddleware = async(passport: PassportStatic)=> {
    if(!process.env.JWT_SECRET)
        return new Error("Required environment JWT_SECRET is missing!")

    const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }

    const callback: VerifyCallback = async(payload, done)=> {
        try {
            const user = await prisma.user.findUnique({ where: { id: payload.sub } });
            if(user)
                return done(null, user);
            else
                return done(null, false)
        } catch (error) {
            done(error, null)
        }
    }



    passport.use(new JwtStrategy(options, callback))
}

