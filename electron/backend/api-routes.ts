import { Express } from 'express';

export function setupRoutes(app: Express, backend: any) {
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });
}
