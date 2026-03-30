# TypeScript Type Definitions

```typescript
// types/workspace.ts
export type WorkspaceStatus = 'active' | 'archived' | 'paused';
export type CreatedFrom = 'branch' | 'pr' | 'issue' | 'main';

export interface Workspace {
  id: string;
  repoId: string;
  name: string;
  workspacePath: string;
  branchName: string;
  createdFrom: CreatedFrom;
  sourceId?: string;
  status: WorkspaceStatus;
  agentInstances: Agent[];
  chatHistory: ChatMessage[];
  metadata: WorkspaceMetadata;
  scripts: ScriptState;
}

export interface WorkspaceMetadata {
  createdAt: Date;
  lastActiveAt: Date;
  archivedAt?: Date;
  notes?: string;
  mcpServers?: MCPServer[];
  todos?: Todo[];
}

export interface ScriptState {
  lastSetupScript?: string;
  lastRunScript?: string;
  runProcessPid?: number;
  lastRunOutput?: string;
}

// types/agent.ts
export type AgentStatus = 'idle' | 'running' | 'working' | 'error' | 'paused';

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  kiroProcessPid?: number;
  status: AgentStatus;
  steeringFile?: string;
  tmuxSessionName: string;
  port: number;
```

createdAt: Date;
lastActiveAt: Date;
metadata?: Record<string, any>;
}

export interface ChatMessage {
id: string;
agentId: string;
role: 'user' | 'assistant' | 'system';
content: string;
timestamp: Date;
metadata?: {
commandExecuted?: string;
filesChanged?: string[];
};
}

// types/repository.ts
export interface Repository {
id: string;
name: string;
path: string;
gitUrl: string;
description?: string;
setupScript?: string;
runScript?: string;
runScriptMode: 'concurrent' | 'nonconcurrent';
archiveScript?: string;
createdAt: Date;
updatedAt: Date;
}

// types/api.ts
export interface ApiResponse<T> {
success: boolean;
data?: T;
error?: ApiError;
}

export interface ApiError {
code: string;
message: string;
details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
data: T[];
total: number;
page: number;
pageSize: number;
hasMore: boolean;
}

// types/ui.ts
export type Theme = 'light' | 'dark' | 'auto';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
id: string;
type: NotificationType;
title: string;
message: string;
duration?: number;
action?: {
label: string;
onClick: () => void;
};
}

```

```
