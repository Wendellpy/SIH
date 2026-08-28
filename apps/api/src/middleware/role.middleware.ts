import { Request, Response, NextFunction } from 'express';
import { db } from '../database/store';

export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers['x-user-role'] as string;
    
    // Log the access attempt
    db.logAccess(role || 'anonymous', req.originalUrl);

    if (!role || !requiredRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }

    next();
  };
};
