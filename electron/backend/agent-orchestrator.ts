export class AgentOrchestrator {
  async createAgent(workspaceId: string, args: any) { return { success: true, data: { id: 'agent1', ...args } }; }
  async listAgents(workspaceId: string) { return { success: true, data: [] }; }
  async startAgent(id: string) { return { success: true }; }
  async stopAgent(id: string) { return { success: true }; }
}
