import { Response } from 'express';

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  const response: any = {
    success: true,
    message,
  };
  if (data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any
) => {
  const response: any = {
    success: false,
    message,
  };
  if (errors !== undefined) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
