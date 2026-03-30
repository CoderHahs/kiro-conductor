# Backend Service Specification

```typescript
// electron/backend/service.ts

import express, { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import Database from 'better-sqlite3';
import path from 'path';
import { WorkspaceManager } from './workspace-manager.js';
import { AgentOrchestrator } from './agent-orchestrator.js';
import { GitHandler } from './git-handler.js';
import { ScriptExecutor } from './script-executor.js';
import { setupRoutes } from './api-routes.js';
import { setupWebSocket } from './websocket-server.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('BackendService');

export class BackendService {
  private app: Express;
  private httpServer: any;
  private io: SocketIOServer;
  private db: Database.Database;
  private workspaceManager: WorkspaceManager;
  private agentOrchestrator: AgentOrchestrator;
  private gitHandler: GitHandler;
  private scriptExecutor: ScriptExecutor;
  private port: number = 3333;

  constructor() {
    this.app = express();
    this.setupMiddleware();

    // Initialize managers
    this.db = new Database(this.getDatabasePath());
    this.workspaceManager = new WorkspaceManager(this.db);
    this.agentOrchestrator = new AgentOrchestrator();
    this.gitHandler = new GitHandler();
    this.scriptExecutor = new ScriptExecutor();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
```

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });

}

async start(port: number = 3333) {
this.port = port;

    // Create HTTP server
    this.httpServer = createServer(this.app);

    // Setup WebSocket
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*' },
    });

    // Setup routes
    setupRoutes(this.app, this);

    // Setup WebSocket handlers
    setupWebSocket(this.io, this);

    // Start server
    return new Promise<void>((resolve, reject) => {
      this.httpServer.listen(port, () => {
        logger.info(`Backend service running on port ${port}`);
        resolve();
      });

      this.httpServer.on('error', reject);
    });

}

async stop() {
return new Promise<void>((resolve) => {
if (this.httpServer) {
this.httpServer.close(() => {
logger.info('Backend service stopped');
resolve();
});
} else {
resolve();
}
});
}

private getDatabasePath(): string {
const homeDir = process.env.HOME || process.env.USERPROFILE || '';
return path.join(homeDir, '.kiro-conductor', 'app.db');
}

// Public API for managers to use
getWorkspaceManager() {
return this.workspaceManager;
}

getAgentOrchestrator() {
return this.agentOrchestrator;
}

getGitHandler() {
return this.gitHandler;
}

getScriptExecutor() {
return this.scriptExecutor;
}

getIOServer() {
return this.io;
}

// Public methods that Electron main process calls
async addRepository(path: string) {
return this.workspaceManager.addRepository(path);
}

async listRepositories() {
return this.workspaceManager.listRepositories();
}

async removeRepository(repoId: string) {
return this.workspaceManager.removeRepository(repoId);
}

async createWorkspace(args: any) {
return this.workspaceManager.createWorkspace(args);
}

async listWorkspaces(repoId: string) {
return this.workspaceManager.listWorkspaces(repoId);
}

async getWorkspace(workspaceId: string) {
return this.workspaceManager.getWorkspace(workspaceId);
}

async archiveWorkspace(workspaceId: string) {
return this.workspaceManager.archiveWorkspace(workspaceId);
}

async createAgent(workspaceId: string, args: any) {
return this.agentOrchestrator.createAgent(workspaceId, args);
}

async listAgents(workspaceId: string) {
return this.agentOrchestrator.listAgents(workspaceId);
}

async startAgent(agentId: string) {
return this.agentOrchestrator.startAgent(agentId);
}

async stopAgent(agentId: string) {
return this.agentOrchestrator.stopAgent(agentId);
}

async executeScript(workspaceId: string, scriptType: string) {
return this.scriptExecutor.executeScript(workspaceId, scriptType);
}

async getDiff(workspaceId: string) {
return this.gitHandler.generateDiff(workspaceId);
}

async createPR(workspaceId: string, options: any) {
return this.gitHandler.createPullRequest(workspaceId, options);
}

async getSetting(key: string) {
const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
const result = stmt.get(key) as any;
return result ? result.value : null;
}

async setSetting(key: string, value: any) {
const stmt = this.db.prepare(
'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
);
stmt.run(key, JSON.stringify(value));
}

async getAllSettings() {
const stmt = this.db.prepare('SELECT \* FROM settings');
return stmt.all();
}
}

```

```
