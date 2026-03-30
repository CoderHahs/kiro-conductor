# API Endpoints (All Routes)

```typescript
// electron/backend/api-routes.ts

import { Express } from 'express';
import { BackendService } from './service.js';

export function setupRoutes(app: Express, backend: BackendService) {
  // ─────────────────────────────────────────────────────────
  // Repository endpoints
  // ─────────────────────────────────────────────────────────

  app.post('/api/repositories', async (req, res) => {
    try {
      const repo = await backend.getWorkspaceManager().addRepository(
        req.body.path || req.body.gitUrl
      );
      backend.getIOServer().emit('repository:created', repo);
      res.json({ success: true, data: repo });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'REPO_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/repositories', async (req, res) => {
    try {
      const repos = await backend.getWorkspaceManager().listRepositories();
      res.json({ success: true, data: repos });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LIST_ERROR', message: error.message },
      });
    }
  });

  app.get('/api/repositories/:id', async (req, res) => {
    try {
      const repo = await backend
        .getWorkspaceManager()
        .getRepository(req.params.id);
      res.json({ success: true, data: repo });
    } catch (error: any) {
      res.status(404).json({
        success: false,
```

        error: { code: 'NOT_FOUND', message: 'Repository not found' },
      });
    }

});

app.delete('/api/repositories/:id', async (req, res) => {
try {
await backend.getWorkspaceManager().removeRepository(req.params.id);
res.json({ success: true });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'DELETE_ERROR', message: error.message },
});
}
});

app.patch('/api/repositories/:id', async (req, res) => {
try {
const repo = await backend
.getWorkspaceManager()
.updateRepository(req.params.id, req.body);
res.json({ success: true, data: repo });
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
const workspace = await backend
.getWorkspaceManager()
.createWorkspace(req.body);
backend.getIOServer().emit('workspace:created', workspace);
res.json({ success: true, data: workspace });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'WS_ERROR', message: error.message },
});
}
});

app.get('/api/workspaces', async (req, res) => {
try {
const repoId = req.query.repoId as string;
const workspaces = await backend
.getWorkspaceManager()
.listWorkspaces(repoId);
res.json({ success: true, data: workspaces });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'LIST_ERROR', message: error.message },
});
}
});

app.get('/api/workspaces/:id', async (req, res) => {
try {
const workspace = await backend
.getWorkspaceManager()
.getWorkspace(req.params.id);
res.json({ success: true, data: workspace });
} catch (error: any) {
res.status(404).json({
success: false,
error: { code: 'NOT_FOUND', message: 'Workspace not found' },
});
}
});

app.post('/api/workspaces/:id/archive', async (req, res) => {
try {
const workspace = await backend
.getWorkspaceManager()
.archiveWorkspace(req.params.id);
backend.getIOServer().emit('workspace:archived', workspace);
res.json({ success: true, data: workspace });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'ARCHIVE_ERROR', message: error.message },
});
}
});

app.post('/api/workspaces/:id/restore', async (req, res) => {
try {
const workspace = await backend
.getWorkspaceManager()
.restoreWorkspace(req.params.id);
backend.getIOServer().emit('workspace:restored', workspace);
res.json({ success: true, data: workspace });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'RESTORE_ERROR', message: error.message },
});
}
});

// ─────────────────────────────────────────────────────────
// Agent endpoints
// ─────────────────────────────────────────────────────────

app.post('/api/agents', async (req, res) => {
try {
const agent = await backend
.getAgentOrchestrator()
.createAgent(req.body.workspaceId, req.body);
backend.getIOServer().emit('agent:created', agent);
res.json({ success: true, data: agent });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'AGENT_ERROR', message: error.message },
});
}
});

app.get('/api/agents', async (req, res) => {
try {
const workspaceId = req.query.workspaceId as string;
const agents = await backend
.getAgentOrchestrator()
.listAgents(workspaceId);
res.json({ success: true, data: agents });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'LIST_ERROR', message: error.message },
});
}
});

app.post('/api/agents/:id/start', async (req, res) => {
try {
const agent = await backend
.getAgentOrchestrator()
.startAgent(req.params.id);
backend.getIOServer().emit('agent:started', agent);
res.json({ success: true, data: agent });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'START_ERROR', message: error.message },
});
}
});

app.post('/api/agents/:id/stop', async (req, res) => {
try {
const agent = await backend
.getAgentOrchestrator()
.stopAgent(req.params.id);
backend.getIOServer().emit('agent:stopped', agent);
res.json({ success: true, data: agent });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'STOP_ERROR', message: error.message },
});
}
});

// ─────────────────────────────────────────────────────────
// Script endpoints
// ─────────────────────────────────────────────────────────

app.post('/api/workspaces/:id/scripts/:type/run', async (req, res) => {
try {
const result = await backend
.getScriptExecutor()
.executeScript(req.params.id, req.params.type, req.body.env || {});
backend.getIOServer().emit('script:done', {
workspaceId: req.params.id,
type: req.params.type,
result,
});
res.json({ success: true, data: result });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'SCRIPT_ERROR', message: error.message },
});
}
});

app.post('/api/workspaces/:id/scripts/:type/stop', async (req, res) => {
try {
await backend.getScriptExecutor().stopScript(req.params.id);
res.json({ success: true });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'STOP_ERROR', message: error.message },
});
}
});

// ─────────────────────────────────────────────────────────
// Diff endpoints
// ─────────────────────────────────────────────────────────

app.get('/api/workspaces/:id/diff', async (req, res) => {
try {
const diff = await backend
.getGitHandler()
.generateDiff(req.params.id);
res.json({ success: true, data: diff });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'DIFF_ERROR', message: error.message },
});
}
});

// ─────────────────────────────────────────────────────────
// PR endpoints
// ─────────────────────────────────────────────────────────

app.post('/api/workspaces/:id/pr', async (req, res) => {
try {
const pr = await backend
.getGitHandler()
.createPullRequest(req.params.id, req.body);
backend.getIOServer().emit('pr:created', pr);
res.json({ success: true, data: pr });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'PR_ERROR', message: error.message },
});
}
});

app.get('/api/workspaces/:id/pr/status', async (req, res) => {
try {
const status = await backend
.getGitHandler()
.getPullRequestStatus(req.params.id);
res.json({ success: true, data: status });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'STATUS_ERROR', message: error.message },
});
}
});

app.post('/api/workspaces/:id/pr/merge', async (req, res) => {
try {
const result = await backend
.getGitHandler()
.mergePullRequest(req.params.id);
backend.getIOServer().emit('pr:merged', result);
res.json({ success: true, data: result });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'MERGE_ERROR', message: error.message },
});
}
});

// ─────────────────────────────────────────────────────────
// Settings endpoints
// ─────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
try {
const settings = await backend.getAllSettings();
res.json({ success: true, data: settings });
} catch (error: any) {
res.status(500).json({
success: false,
error: { code: 'SETTINGS_ERROR', message: error.message },
});
}
});

app.get('/api/settings/:key', async (req, res) => {
try {
const value = await backend.getSetting(req.params.key);
res.json({ success: true, data: { key: req.params.key, value } });
} catch (error: any) {
res.status(404).json({
success: false,
error: { code: 'NOT_FOUND', message: 'Setting not found' },
});
}
});

app.post('/api/settings', async (req, res) => {
try {
await backend.setSetting(req.body.key, req.body.value);
res.json({ success: true });
} catch (error: any) {
res.status(400).json({
success: false,
error: { code: 'SETTINGS_ERROR', message: error.message },
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

```

```
