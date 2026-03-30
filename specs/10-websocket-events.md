# WebSocket Events

```typescript
// electron/backend/websocket-server.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { BackendService } from './service.js';

export function setupWebSocket(io: SocketIOServer, backend: BackendService) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // ─────────────────────────────────────────────────────
    // Workspace subscriptions
    // ─────────────────────────────────────────────────────

    socket.on('subscribe:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Client ${socket.id} subscribed to workspace ${workspaceId}`);
    });

    socket.on('unsubscribe:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // ─────────────────────────────────────────────────────
    // Agent subscriptions
    // ─────────────────────────────────────────────────────

    socket.on('subscribe:agent', (agentId: string) => {
      socket.join(`agent:${agentId}`);
      console.log(`Client ${socket.id} subscribed to agent ${agentId}`);
    });

    socket.on('unsubscribe:agent', (agentId: string) => {
      socket.leave(`agent:${agentId}`);
    });

    // ─────────────────────────────────────────────────────
    // Chat messages
    // ─────────────────────────────────────────────────────

    socket.on('chat:send', async (data: { agentId: string; message: string }) => {
      // Store in database
      // Send to agent process
      // Broadcast to subscribers
      io.to(`agent:${data.agentId}`).emit('chat:message', {
        id: generateId(),
        agentId: data.agentId,
```

        role: 'user',
        content: data.message,
        timestamp: new Date(),
      });
    });

    // ─────────────────────────────────────────────────────
    // Terminal output
    // ─────────────────────────────────────────────────────

    socket.on('terminal:subscribe', (workspaceId: string) => {
      socket.join(`terminal:${workspaceId}`);
    });

    // ─────────────────────────────────────────────────────
    // Disconnection
    // ─────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

});

// ─────────────────────────────────────────────────────
// Server-side event broadcasts
// ─────────────────────────────────────────────────────

// These are called from other parts of the backend
return {
broadcastWorkspaceUpdate: (workspaceId: string, update: any) => {
io.to(`workspace:${workspaceId}`).emit('workspace:updated', update);
},

    broadcastAgentUpdate: (agentId: string, update: any) => {
      io.to(`agent:${agentId}`).emit('agent:updated', update);
    },

    broadcastTerminalOutput: (workspaceId: string, output: string) => {
      io.to(`terminal:${workspaceId}`).emit('terminal:output', { output });
    },

    broadcastChatMessage: (agentId: string, message: any) => {
      io.to(`agent:${agentId}`).emit('chat:message', message);
    },

};
}

function generateId(): string {
return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

```

```
