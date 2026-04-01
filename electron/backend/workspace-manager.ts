import Database from 'better-sqlite3';

export class WorkspaceManager {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async addRepository(path: string) { return { success: true, data: { id: 'repo1', path } }; }
  async listRepositories() { return { success: true, data: [] }; }
  async removeRepository(id: string) { return { success: true }; }
  async createWorkspace(args: any) { return { success: true, data: { id: 'ws1', ...args } }; }
  async listWorkspaces(repoId: string) { return { success: true, data: [] }; }
  async getWorkspace(id: string) { return { success: true, data: { id } }; }
  async archiveWorkspace(id: string) { return { success: true }; }
}
