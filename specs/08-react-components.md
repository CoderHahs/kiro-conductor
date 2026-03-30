# React Component Specifications

```typescript
// src/components/WorkspaceDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAgents } from '@/hooks/useAgents';
import { AgentsPanel } from './AgentsPanel';
import { ChatPanel } from './ChatPanel';
import { ActivityPanel } from './ActivityPanel';
import { TerminalPanel } from './TerminalPanel';

export const WorkspaceDashboard: React.FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const workspace = useWorkspaceStore((s) => s.activeWorkspace());
  const { agents } = useAgents(workspaceId);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    agents[0]?.id || null
  );

  if (!workspace) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-sm text-gray-500">{workspace.branchName}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary">⌘O Open IDE</button>
          <button className="btn btn-secondary">⋮ More</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Left: Agents */}
        <div className="col-span-1 border rounded-lg p-4 bg-slate-50">
          <AgentsPanel
```

            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            workspaceId={workspaceId}
          />
        </div>

        {/* Center: Chat */}
        <div className="col-span-1 border rounded-lg flex flex-col bg-white">
          {selectedAgentId ? (
            <ChatPanel agentId={selectedAgentId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select an agent to chat
            </div>
          )}
        </div>

        {/* Right: Activity */}
        <div className="col-span-1 border rounded-lg p-4 bg-slate-50">
          <ActivityPanel workspaceId={workspaceId} />
        </div>
      </div>

      {/* Terminal */}
      <div className="h-48 border rounded-lg bg-black overflow-hidden">
        <TerminalPanel workspaceId={workspaceId} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button className="btn btn-secondary">⊕ Run (⌘R)</button>
        <button className="btn btn-secondary">⊕ Test (⌘T)</button>
        <button className="btn btn-secondary">⊕ Diff (⌘D)</button>
        <button className="btn btn-primary">⊕ Create PR (⌘⇧P)</button>
      </div>
    </div>

);
};

```

```
