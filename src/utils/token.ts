import { env } from "@/config/envConfig";
import type { User } from "@/routes/users/userModel";
import type { Response } from "express";
import jwt from "jsonwebtoken";

export const signToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set!");
  }

  const token = jwt.sign({ sub: userId, iat: Date.now() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  return token;
};

export const attachToken = (user: User) => {
  //create jwt token
  const token = signToken(user.id!);

  return {
    token,
    ...user,
  };
};

export const attachCookie = (userId: string, res: Response) => {
  //create jwt token
  const token = signToken(userId);

    res.cookie("auth_token", token, {
        secure: true,
        sameSite:'none',
        httpOnly:true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
};

export function generateVerificationCode() {
  // Generate a 6-digit random number
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  return verificationCode;
}
