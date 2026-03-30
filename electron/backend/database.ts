import Database = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let db: Database.Database | null = null;

export function getDbPath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  const homeDir = os.homedir();
  return path.join(homeDir, '.kiro-conductor', 'app.db');
}

export function initDB(dbPath?: string) {
  const actualPath = getDbPath(dbPath);

  if (actualPath !== ':memory:') {
    const dir = path.dirname(actualPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  db = new Database(actualPath);

  // Enable WAL mode and foreign keys
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables based on schema
  db.exec(`
    -- Repositories table
    CREATE TABLE IF NOT EXISTS repositories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      git_url TEXT NOT NULL,
      description TEXT,
      setup_script TEXT,
      run_script TEXT,
      run_script_mode TEXT DEFAULT 'concurrent' CHECK(run_script_mode IN ('concurrent', 'nonconcurrent')),
      archive_script TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);

    -- Workspaces table
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      name TEXT NOT NULL,
      workspace_path TEXT NOT NULL UNIQUE,
      branch_name TEXT NOT NULL,
      created_from TEXT DEFAULT 'main' CHECK(created_from IN ('branch', 'pr', 'issue', 'main')),
      source_id TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived', 'paused')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_active_at TIMESTAMP,
      archived_at TIMESTAMP,
      notes TEXT,
      metadata JSON,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workspaces_repo_id ON workspaces(repo_id);
    CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);
    CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at);

    -- Agents table
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      kiro_process_pid INTEGER,
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'running', 'working', 'error', 'paused')),
      steering_file TEXT,
      tmux_session_name TEXT,
      port INTEGER NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_active_at TIMESTAMP,
      metadata JSON,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON agents(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    CREATE INDEX IF NOT EXISTS idx_agents_port ON agents(port);

    -- Chat messages table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON chat_messages(agent_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

    -- Snapshots/Checkpoints table
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      files_modified JSON,
      chat_history_length INTEGER,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_workspace_id ON snapshots(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp);

    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT CHECK(type IN ('string', 'number', 'boolean', 'json')),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit log table
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      status TEXT CHECK(status IN ('success', 'failure')),
      details JSON
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

    -- MCP Servers configuration
    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      command TEXT NOT NULL,
      args TEXT,
      config JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_mcp_servers_workspace_id ON mcp_servers(workspace_id);

    -- Todos/Tasks table
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'done')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_todos_workspace_id ON todos(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
  `);

  return db;
}

export function getDB(): Database.Database {
  if (!db) {
    throw new Error('Database has not been initialized. Call initDB() first.');
  }
  return db;
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

// Typed query helpers
export function getOne<T>(sql: string, params: any[] = []): T | undefined {
  const statement = getDB().prepare(sql);
  return statement.get(...params) as T | undefined;
}

export function getAll<T>(sql: string, params: any[] = []): T[] {
  const statement = getDB().prepare(sql);
  return statement.all(...params) as T[];
}

export function run(sql: string, params: any[] = []): Database.RunResult {
  const statement = getDB().prepare(sql);
  return statement.run(...params);
}

export function transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  return getDB().transaction(fn);
}
