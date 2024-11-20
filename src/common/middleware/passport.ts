import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifyCallback } from "passport-jwt";
import { Strategy as GoogleStrategy, StrategyOptions as GoogleOptions } from "passport-google-oauth20";
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

export const googleAuthStrategy = async(passport: PassportStatic)=> {
    if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
        return new Error("Required environment: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing!")

    const googleOptions: GoogleOptions = {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/redirect"
    }
    const strategy = new GoogleStrategy( googleOptions,
        function(accessToken, refreshToken, profile, cb) {
            // User.findOrCreate({ googleId: profile.id }, function (err, user) {
            // return cb(err, user);
            // });
        }
    )
}

