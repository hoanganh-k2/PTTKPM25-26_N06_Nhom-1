// Middleware to add cache headers for static data endpoints
import { Request, Response, NextFunction } from 'express';

export function cacheMiddleware(maxAge: number = 300) { // 5 minutes default
  return (req: Request, res: Response, next: NextFunction) => {
    // Cache cho GET requests của static data
    if (req.method === 'GET' && (
      req.path.includes('/categories') ||
      req.path.includes('/authors') ||
      req.path.includes('/publishers')
    )) {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('ETag', `"${Date.now()}"`);
    }
    
    next();
  };
}