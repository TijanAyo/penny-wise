import { Request, Response, NextFunction } from "express";
import { environment } from "../config";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import User from "../models/user.model";
import { Iuser } from "../common/interface";

declare module "express-serve-static-core" {
  interface Request {
    user?: Iuser;
  }
}

export const AuthMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          data: null,
          message: "Authentication required, Kindly provide a valid token",
          success: false,
        });
      }

      const decoded = jwt.verify(token, environment.JWT_SECRET) as JwtPayload;

      const user = await User.findById({ _id: decoded.userId });
      if (!user) {
        return res.status(401).json({
          data: null,
          message: "User not found",
          success: false,
        });
      }
      req.user = user;
      next();
    } catch (error: any) {
      console.error("AuthMiddlewareErr:", error);

      if (error instanceof TokenExpiredError) {
        return res.status(400).json({
          data: null,
          message: "Token expired",
          success: false,
        });
      }

      if (error instanceof JsonWebTokenError) {
        console.log("JSONWEBTokenError: Invalid token signature");
        return res.status(400).json({
          data: null,
          message: "Invalid token",
          success: false,
        });
      }

      return res.status(401).json({
        data: null,
        message: "Invalid token",
        success: false,
      });
    }
  } else {
    return res.status(403).json({
      data: null,
      message: "Authorization required, token is required",
      success: false,
    });
  }
};
