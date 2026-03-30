import { initDB, closeDB, getDB, getOne, getAll, run, transaction } from '../../electron/backend/database';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Database Wrapper', () => {
  const testDbPath = ':memory:';

  beforeEach(() => {
    initDB(testDbPath);
  });

  afterEach(() => {
    closeDB();
  });

  it('should create all 9 tables', () => {
    const tables = getAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('repositories');
    expect(tableNames).toContain('workspaces');
    expect(tableNames).toContain('agents');
    expect(tableNames).toContain('chat_messages');
    expect(tableNames).toContain('snapshots');
    expect(tableNames).toContain('settings');
    expect(tableNames).toContain('audit_log');
    expect(tableNames).toContain('mcp_servers');
    expect(tableNames).toContain('todos');
    expect(tableNames.length).toBe(9);
  });

  it('should enable foreign keys', () => {
    // Note: In-memory databases do not support WAL mode
    const foreignKeys = getOne<{ foreign_keys: number }>('PRAGMA foreign_keys');
    expect(foreignKeys?.foreign_keys).toBe(1);
  });

  describe('Basic CRUD on repositories', () => {
    it('should insert and retrieve a repository', () => {
      run(`
        INSERT INTO repositories (id, name, path, git_url, description)
        VALUES (?, ?, ?, ?, ?)
      `, ['repo-1', 'Test Repo', '/path/to/repo', 'git@github.com:test/repo.git', 'Test description']);

      const repo = getOne<{ id: string, name: string }>('SELECT * FROM repositories WHERE id = ?', ['repo-1']);
      expect(repo).toBeDefined();
      expect(repo?.name).toBe('Test Repo');
    });

    it('should update a repository', () => {
      run(`
        INSERT INTO repositories (id, name, path, git_url)
        VALUES (?, ?, ?, ?)
      `, ['repo-2', 'Old Name', '/path/2', 'git@github.com:test/repo2.git']);

      run('UPDATE repositories SET name = ? WHERE id = ?', ['New Name', 'repo-2']);

      const repo = getOne<{ name: string }>('SELECT name FROM repositories WHERE id = ?', ['repo-2']);
      expect(repo?.name).toBe('New Name');
    });

    it('should delete a repository', () => {
      run(`
        INSERT INTO repositories (id, name, path, git_url)
        VALUES (?, ?, ?, ?)
      `, ['repo-3', 'To Delete', '/path/3', 'git@github.com:test/repo3.git']);

      run('DELETE FROM repositories WHERE id = ?', ['repo-3']);

      const repo = getOne('SELECT * FROM repositories WHERE id = ?', ['repo-3']);
      expect(repo).toBeUndefined();
    });
  });

  describe('Transactions', () => {
    it('should rollback transaction on error', () => {
      const insertRepo = () => {
        run(`
          INSERT INTO repositories (id, name, path, git_url)
          VALUES (?, ?, ?, ?)
        `, ['repo-tx', 'Tx Repo', '/path/tx', 'git@github.com:test/tx.git']);

        // Throw error to trigger rollback
        throw new Error('Intentional error');
      };

      const failingTx = transaction(insertRepo);

      expect(() => failingTx()).toThrow('Intentional error');

      // Verify the repo was not inserted due to rollback
      const repo = getOne('SELECT * FROM repositories WHERE id = ?', ['repo-tx']);
      expect(repo).toBeUndefined();
    });

    it('should commit transaction on success', () => {
      const insertMultiple = () => {
        run(`
          INSERT INTO repositories (id, name, path, git_url)
          VALUES (?, ?, ?, ?)
        `, ['repo-tx-1', 'Tx Repo 1', '/path/tx1', 'git@github.com:test/tx1.git']);

        run(`
          INSERT INTO repositories (id, name, path, git_url)
          VALUES (?, ?, ?, ?)
        `, ['repo-tx-2', 'Tx Repo 2', '/path/tx2', 'git@github.com:test/tx2.git']);
      };

      const successfulTx = transaction(insertMultiple);
      successfulTx();

      const repos = getAll<{ id: string }>('SELECT id FROM repositories WHERE id LIKE ?', ['repo-tx-%']);
      expect(repos.length).toBe(2);
    });
  });
});

describe('Database File Creation', () => {
  const tempDir = path.join(os.tmpdir(), 'kiro-test-' + Date.now());
  const tempDbPath = path.join(tempDir, 'test.db');

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    closeDB();
  });

  it('should create the db file and directory if they do not exist', () => {
    expect(fs.existsSync(tempDir)).toBe(false);
    expect(fs.existsSync(tempDbPath)).toBe(false);

    initDB(tempDbPath);

    expect(fs.existsSync(tempDir)).toBe(true);
    expect(fs.existsSync(tempDbPath)).toBe(true);

    const journalMode = getOne<{ journal_mode: string }>('PRAGMA journal_mode');
    expect(journalMode?.journal_mode.toUpperCase()).toBe('WAL');
  });
});
