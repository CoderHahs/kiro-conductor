import Database from 'better-sqlite3';
import { GitHandler } from './git-handler';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as os from 'os';

export class WorkspaceManager {
  private db: Database.Database;
  private gitHandler: GitHandler;

  constructor(db: Database.Database) {
    this.db = db;
    this.gitHandler = new GitHandler();
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  async addRepository(repoPath: string) {
    try {
      if (!fs.existsSync(repoPath)) {
        throw new Error('Path does not exist');
      }

      const isRepo = await this.gitHandler.isGitRepo(repoPath);
      if (!isRepo) {
        throw new Error('Not a valid git repository');
      }

      const name = path.basename(repoPath);
      const gitUrl = await this.gitHandler.getRemoteUrl(repoPath);
      const id = this.generateId();

      const stmt = this.db.prepare(`
        INSERT INTO repositories (id, name, path, git_url)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(id, name, repoPath, gitUrl || '');

      const repo = this.db.prepare('SELECT * FROM repositories WHERE id = ?').get(id);

      return { success: true, data: repo };
    } catch (error: any) {
      return { success: false, error: { code: 'ADD_REPO_ERROR', message: error.message } };
    }
  }

  async listRepositories() {
    try {
      const repos = this.db.prepare('SELECT * FROM repositories ORDER BY name ASC').all();
      return { success: true, data: repos };
    } catch (error: any) {
      return { success: false, error: { code: 'LIST_REPOS_ERROR', message: error.message } };
    }
  }

  async removeRepository(id: string) {
    try {
      const stmt = this.db.prepare('DELETE FROM repositories WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new Error('Repository not found');
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { code: 'REMOVE_REPO_ERROR', message: error.message } };
    }
  }

  async updateRepository(id: string, config: any) {
    try {
      const allowedKeys = ['description', 'setup_script', 'run_script', 'run_script_mode', 'archive_script', 'name', 'path', 'git_url'];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(config)) {
        if (allowedKeys.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
         return { success: true };
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE repositories
        SET ${updates.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      const repo = this.db.prepare('SELECT * FROM repositories WHERE id = ?').get(id);
      return { success: true, data: repo };
    } catch (error: any) {
       return { success: false, error: { code: 'UPDATE_REPO_ERROR', message: error.message } };
    }
  }

  async createWorkspace(args: { repoId: string, name: string, branchName: string, createdFrom?: string, sourceId?: string, notes?: string }) {
    try {
      const repo = this.db.prepare('SELECT * FROM repositories WHERE id = ?').get(args.repoId) as any;
      if (!repo) {
        throw new Error('Repository not found');
      }

      const id = this.generateId();

      const homeDir = os.homedir();
      const workspacesDir = path.join(homeDir, '.kiro-conductor', 'workspaces');
      if (!fs.existsSync(workspacesDir)) {
          fs.mkdirSync(workspacesDir, { recursive: true });
      }

      const workspacePath = path.join(workspacesDir, id);

      // Clone from local path
      await this.gitHandler.clone(repo.path, workspacePath);

      // Create and checkout branch
      await this.gitHandler.createBranch(workspacePath, args.branchName);

      const stmt = this.db.prepare(`
        INSERT INTO workspaces (id, repo_id, name, workspace_path, branch_name, created_from, source_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        args.repoId,
        args.name,
        workspacePath,
        args.branchName,
        args.createdFrom || 'main',
        args.sourceId || null,
        args.notes || null
      );

      const workspace = this.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);

      return { success: true, data: workspace };
    } catch (error: any) {
      return { success: false, error: { code: 'CREATE_WORKSPACE_ERROR', message: error.message } };
    }
  }

  async listWorkspaces(repoId?: string) {
    try {
      let query = 'SELECT * FROM workspaces';
      let params: any[] = [];

      if (repoId) {
        query += ' WHERE repo_id = ?';
        params.push(repoId);
      }

      query += ' ORDER BY created_at DESC';

      const workspaces = this.db.prepare(query).all(...params);
      return { success: true, data: workspaces };
    } catch (error: any) {
      return { success: false, error: { code: 'LIST_WORKSPACES_ERROR', message: error.message } };
    }
  }

  async getWorkspace(id: string) {
    try {
      const workspace = this.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
      if (!workspace) {
         throw new Error('Workspace not found');
      }
      return { success: true, data: workspace };
    } catch (error: any) {
      return { success: false, error: { code: 'GET_WORKSPACE_ERROR', message: error.message } };
    }
  }

  async archiveWorkspace(id: string) {
    try {
      const stmt = this.db.prepare(`
        UPDATE workspaces
        SET status = 'archived', archived_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != 'archived'
      `);
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new Error('Workspace not found or already archived');
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: { code: 'ARCHIVE_WORKSPACE_ERROR', message: error.message } };
    }
  }

  async restoreWorkspace(id: string) {
    try {
      const stmt = this.db.prepare(`
        UPDATE workspaces
        SET status = 'active', archived_at = NULL
        WHERE id = ? AND status = 'archived'
      `);
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new Error('Workspace not found or not archived');
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: { code: 'RESTORE_WORKSPACE_ERROR', message: error.message } };
    }
  }
}
