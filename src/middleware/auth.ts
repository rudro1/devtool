import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { sendErrorResponse } from '../utils/response';

interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'Authorization header is required'
    );
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'Invalid or expired token'
    );
  }
};

export const authorizeMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'maintainer') {
    return sendErrorResponse(
      res,
      StatusCodes.FORBIDDEN,
      'Access denied. Maintainer role required.'
    );
  }
  next();
};
