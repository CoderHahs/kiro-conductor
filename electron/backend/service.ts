export class BackendService {
  async start(port: number) {
    console.log(`Backend started on port ${port}`);
  }

  async stop() {
    console.log('Backend stopped');
  }

  // Repo
  async addRepository(path: string) { return { success: true, data: { id: 'repo1', path } }; }
  async listRepositories() { return { success: true, data: [] }; }
  async removeRepository(id: string) { return { success: true }; }
  async updateRepository(id: string, config: any) { return { success: true }; }

  // Workspace
  async createWorkspace(args: any) { return { success: true, data: { id: 'ws1', ...args } }; }
  async listWorkspaces(repoId: string) { return { success: true, data: [] }; }
  async getWorkspace(id: string) { return { success: true, data: { id } }; }
  async archiveWorkspace(id: string) { return { success: true }; }
  async restoreWorkspace(id: string) { return { success: true }; }
  async deleteWorkspace(id: string) { return { success: true }; }

  // Agent
  async createAgent(workspaceId: string, args: any) { return { success: true, data: { id: 'agent1', ...args } }; }
  async listAgents(workspaceId: string) { return { success: true, data: [] }; }
  async startAgent(id: string) { return { success: true }; }
  async stopAgent(id: string) { return { success: true }; }
  async deleteAgent(id: string) { return { success: true }; }

  // Script
  async executeScript(workspaceId: string, scriptType: string) { return { success: true }; }
  async stopScript(workspaceId: string) { return { success: true }; }

  // Diff
  async getDiff(workspaceId: string) { return { success: true, data: '' }; }
  async approveDiff(workspaceId: string, files: string[]) { return { success: true }; }

  // PR
  async createPR(workspaceId: string, options: any) { return { success: true, data: 'https://github.com/pr/1' }; }
  async mergePR(workspaceId: string) { return { success: true }; }
  async getPRStatus(workspaceId: string) { return { success: true, data: { status: 'open' } }; }

  // Settings
  async getSetting(key: string) { return { success: true, data: null }; }
  async setSetting(key: string, value: any) { return { success: true }; }
  async getAllSettings() { return { success: true, data: {} }; }
}
