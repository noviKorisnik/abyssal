import { Express, Router } from 'express';

export function setupRoutes(app: Express): void {
  const apiRouter = Router();
  
  // Base API route
  apiRouter.get('/', (req, res) => {
    res.json({
      message: 'Abyssal API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Feature routes will be added here as they are implemented
  // Example: apiRouter.use('/games', gameRoutes);
  // Example: apiRouter.use('/players', playerRoutes);

  app.use('/api', apiRouter);

  // Catch-all for undefined routes
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method
    });
  });
}