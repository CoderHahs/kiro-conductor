# Database Schema (SQLite)

```sql
PRAGMA foreign_keys = ON;

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

CREATE INDEX idx_repositories_name ON repositories(name);

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

CREATE INDEX idx_workspaces_repo_id ON workspaces(repo_id);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);

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
```

CREATE INDEX idx_agents_workspace_id ON agents(workspace_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_port ON agents(port);

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

CREATE INDEX idx_chat_messages_agent_id ON chat_messages(agent_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

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

CREATE INDEX idx_snapshots_workspace_id ON snapshots(workspace_id);
CREATE INDEX idx_snapshots_timestamp ON snapshots(timestamp);

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

CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_action ON audit_log(action);

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

CREATE INDEX idx_mcp_servers_workspace_id ON mcp_servers(workspace_id);

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

CREATE INDEX idx_todos_workspace_id ON todos(workspace_id);
CREATE INDEX idx_todos_status ON todos(status);

```

```
