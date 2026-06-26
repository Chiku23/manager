import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (status >= 500) {
    console.error('[Error Handler]:', error);
  }

  return res.status(status).json({
    error: status >= 500 ? 'Internal server error' : message,
  });
}
