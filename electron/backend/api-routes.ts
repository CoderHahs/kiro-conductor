import { Express } from 'express';
import { BackendService } from './service.js';

export function setupRoutes(app: Express, backend: BackendService) {
  // ─────────────────────────────────────────────────────────
  // Repository endpoints
  // ─────────────────────────────────────────────────────────

  app.post('/api/repositories', async (req, res) => {
    try {
      const result = await backend.addRepository(
        req.body.path || req.body.gitUrl
      );
      if (!result.success) {
        return res.status(400).json(result);
      }
      backend.getIOServer().emit('repository:created', result.data);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'REPO_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/repositories', async (req, res) => {
    try {
      const result = await backend.listRepositories();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LIST_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/repositories/:id', async (req, res) => {
    try {
      const result = await backend.listRepositories();
      if (!result.success) {
        return res.status(500).json(result);
      }
      const repo = result.data?.find((r: any) => r.id === req.params.id);
      if (!repo) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Repository not found' } });
      }
      res.json({ success: true, data: repo });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repository not found' },
      });
    }
  });

  app.delete('/api/repositories/:id', async (req, res) => {
    try {
      const result = await backend.removeRepository(req.params.id);
      if (!result.success) {
        return res.status(500).json(result);
      }
      backend.getIOServer().emit('repository:deleted', req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      });
    }
  });

  app.patch('/api/repositories/:id', async (req, res) => {
    try {
      const result = await backend.updateRepository(req.params.id, req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      backend.getIOServer().emit('repository:updated', result.data);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_ERROR', message: error.message },
      });
    }
  });

  // ─────────────────────────────────────────────────────────
  // Workspace endpoints
  // ─────────────────────────────────────────────────────────

  app.post('/api/workspaces', async (req, res) => {
    try {
      const result = await backend.createWorkspace(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      backend.getIOServer().emit('workspace:created', result.data);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'WS_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/workspaces', async (req, res) => {
    try {
      const repoId = req.query.repoId as string | undefined;
      const result = await backend.listWorkspaces(repoId as any);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LIST_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/workspaces/:id', async (req, res) => {
    try {
      const result = await backend.getWorkspace(req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
    }
  });

  app.post('/api/workspaces/:id/archive', async (req, res) => {
    try {
      const result = await backend.archiveWorkspace(req.params.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      backend.getIOServer().emit('workspace:archived', (result as any).data || req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'ARCHIVE_ERROR', message: error.message },
      });
    }
  });

  app.post('/api/workspaces/:id/restore', async (req, res) => {
    try {
      const result = await backend.restoreWorkspace(req.params.id);
      if (!result.success) {
        return res.status(400).json(result);
      }
      backend.getIOServer().emit('workspace:restored', (result as any).data || req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'RESTORE_ERROR', message: error.message },
      });
    }
  });

  // ─────────────────────────────────────────────────────────
  // Health check
  // ─────────────────────────────────────────────────────────

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });
}
