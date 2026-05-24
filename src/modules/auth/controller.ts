import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../config/mock-db';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/response';
import { SignupRequest, LoginRequest, User } from './types';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'contributor' }: SignupRequest = req.body;

    if (!name || !email || !password) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Name, email, and password are required'
      );
    }

    if (role && !['contributor', 'maintainer'].includes(role)) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Role must be either contributor or maintainer'
      );
    }

    const existingUser = await db.users.findByEmail(email);

    if (existingUser) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'User with this email already exists'
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await db.users.insert({
      name,
      email,
      password: hashedPassword,
      role: role as 'contributor' | 'maintainer'
    });

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccessResponse(
      res,
      StatusCodes.CREATED,
      'User registered successfully',
      userWithoutPassword
    );
  } catch (error) {
    console.error('Signup error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Email and password are required'
      );
    }

    const user = await db.users.findByEmail(email);

    if (!user) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN } as any
    );

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccessResponse(
      res,
      StatusCodes.OK,
      'Login successful',
      { token, user: userWithoutPassword }
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};
