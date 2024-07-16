import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User as UserType } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import { db } from "../db";
import bcrypt from "bcryptjs";

const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (
  user: UserType,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const password = await bcrypt.hash(req.body.password, 12);
    const newUser = await db.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role || "USER",
      },
    });
   

    const url = `${req.protocol}://${req.get("host")}/me`;
    // await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);
  }
);
