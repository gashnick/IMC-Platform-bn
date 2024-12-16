import prisma from "@/config/prisma";
import { logger } from "@/server";
import type { User } from "@prisma/client";
import type { Request } from "express";
import type { PassportStatic } from "passport";
import { type StrategyOptions as GoogleOptions, Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, type StrategyOptions, type VerifyCallback } from "passport-jwt";

const cookieExtractor = (req: Request) => {
    let token = null;

    if (req?.cookies) {
        token = req.cookies.auth_token;
    }

    return token;
};

export const jwtAuthMiddleware = async (passport: PassportStatic) => {
    if (!process.env.JWT_SECRET) return new Error("Required environment JWT_SECRET is missing!");

    const options: StrategyOptions = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
    };

    const callback: VerifyCallback = async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: payload.sub } });
            if (user) return done(null, user);
            else return done(new Error("User Doesn't exists any more!"), false);
        } catch (error) {
            done(error, null);
        }
    };

    passport.use(new JwtStrategy(options, callback));
};

export const googleAuthStrategy = async (passport: PassportStatic) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    return new Error("Required environment: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing!");

  const googleOptions: GoogleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect",
  };

  const strategy = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, cb) => {
        try {
            const user = await prisma.user.upsert({
                where: { email: profile?.emails?.[0].value },
                update: {
                    googleId: profile.id,
                },
                create: {
                    email: profile?.emails?.[0].value || "bivakumana@gmail.com",
                    name: Object.values(profile.name || {}).join(" "),
                    googleId: profile.id,
                },
                omit: { password: true },
            });
            return cb(null, user);
        } catch (error) {
            logger.error(error, `Google Strategy Error Occured: ${(error as Error).message}`);
            return cb(error, false);
        }
    });

    passport.serializeUser((user, done) => {
        done(null, (user as User).id);
    });

    passport.deserializeUser(async (id, done) => {
        prisma.user.findUnique({ where: { id: id as string } }).then((value) => {
            done(null, value);
        });
    });

    passport.use(strategy);
};
