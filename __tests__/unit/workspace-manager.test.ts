import { WorkspaceManager } from '../../electron/backend/workspace-manager';
import { Database } from '../../electron/backend/database';
import { GitHandler } from '../../electron/backend/git-handler';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('../../electron/backend/git-handler');

describe('WorkspaceManager', () => {
  let db: ReturnType<typeof Database.getInstance>;
  let manager: WorkspaceManager;

  beforeEach(() => {
    db = Database.getInstance();
    db.init(':memory:');
    manager = new WorkspaceManager(db.getDB());

    // Setup standard mock behavior
    (GitHandler.prototype.isGitRepo as jest.Mock).mockResolvedValue(true);
    (GitHandler.prototype.getRemoteUrl as jest.Mock).mockResolvedValue('https://github.com/test/repo.git');
    (GitHandler.prototype.clone as jest.Mock).mockResolvedValue(undefined);
    (GitHandler.prototype.createBranch as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    db.close();
    jest.clearAllMocks();
  });

  describe('Repository CRUD', () => {
    it('should add a repository successfully', async () => {
      // Mock fs.existsSync to true for repo path
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await manager.addRepository('/path/to/myrepo');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('myrepo');
      expect(result.data.path).toBe('/path/to/myrepo');
      expect(result.data.git_url).toBe('https://github.com/test/repo.git');

      // Check DB directly
      const records = db.getDB().prepare('SELECT * FROM repositories').all();
      expect(records.length).toBe(1);
    });

    it('should fail to add repo if path does not exist', async () => {
       jest.spyOn(fs, 'existsSync').mockReturnValue(false);

       const result = await manager.addRepository('/fake/path');
       expect(result.success).toBe(false);
       expect(result.error?.message).toBe('Path does not exist');
    });

    it('should list repositories', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      await manager.addRepository('/path/1');
      await manager.addRepository('/path/2');

      const result = await manager.listRepositories();
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });

    it('should update a repository', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const addRes = await manager.addRepository('/path/to/repo');
      const repoId = addRes.data.id;

      const updateRes = await manager.updateRepository(repoId, { description: 'New desc' });
      expect(updateRes.success).toBe(true);
      expect(updateRes.data.description).toBe('New desc');
    });

    it('should remove a repository', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const addRes = await manager.addRepository('/path/to/repo');
      const repoId = addRes.data.id;

      const removeRes = await manager.removeRepository(repoId);
      expect(removeRes.success).toBe(true);

      const listRes = await manager.listRepositories();
      expect(listRes.data.length).toBe(0);
    });
  });

  describe('Workspace CRUD', () => {
    let repoId: string;

    beforeEach(async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const addRes = await manager.addRepository('/path/to/repo');
      repoId = addRes.data.id;
    });

    it('should create a workspace', async () => {
       // Mock mkdirSync
       jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

       const result = await manager.createWorkspace({
         repoId,
         name: 'Test WS',
         branchName: 'feature/test'
       });

       expect(result.success).toBe(true);
       expect(result.data).toBeDefined();
       expect(result.data.name).toBe('Test WS');
       expect(result.data.branch_name).toBe('feature/test');
       expect(result.data.repo_id).toBe(repoId);

       // Check git handler was called
       expect(GitHandler.prototype.clone).toHaveBeenCalled();
       expect(GitHandler.prototype.createBranch).toHaveBeenCalled();
    });

    it('should list workspaces for a repo', async () => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      await manager.createWorkspace({ repoId, name: 'WS1', branchName: 'main' });
      await manager.createWorkspace({ repoId, name: 'WS2', branchName: 'dev' });

      const result = await manager.listWorkspaces(repoId);
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });

    it('should get a specific workspace', async () => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      const createRes = await manager.createWorkspace({ repoId, name: 'WS1', branchName: 'main' });
      const wsId = createRes.data.id;

      const getRes = await manager.getWorkspace(wsId);
      expect(getRes.success).toBe(true);
      expect(getRes.data.id).toBe(wsId);
    });

    it('should archive and restore a workspace', async () => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      const createRes = await manager.createWorkspace({ repoId, name: 'WS1', branchName: 'main' });
      const wsId = createRes.data.id;

      const archiveRes = await manager.archiveWorkspace(wsId);
      expect(archiveRes.success).toBe(true);

      let getRes = await manager.getWorkspace(wsId);
      expect(getRes.data.status).toBe('archived');
      expect(getRes.data.archived_at).toBeDefined();

      const restoreRes = await manager.restoreWorkspace(wsId);
      expect(restoreRes.success).toBe(true);

      getRes = await manager.getWorkspace(wsId);
      expect(getRes.data.status).toBe('active');
      expect(getRes.data.archived_at).toBeNull();
    });
  });
});
