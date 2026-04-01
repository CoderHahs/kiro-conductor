import { GitHandler } from '../../electron/backend/git-handler';
import { simpleGit } from 'simple-git';

jest.mock('simple-git');

describe('GitHandler', () => {
  let gitHandler: GitHandler;
  let mockGit: any;

  beforeEach(() => {
    mockGit = {
      checkIsRepo: jest.fn(),
      getRemotes: jest.fn(),
      clone: jest.fn(),
      checkoutLocalBranch: jest.fn(),
      checkout: jest.fn(),
      diff: jest.fn(),
      add: jest.fn(),
      commit: jest.fn(),
      push: jest.fn(),
      branch: jest.fn()
    };
    (simpleGit as jest.Mock).mockReturnValue(mockGit);
    gitHandler = new GitHandler();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should check if path is a git repo', async () => {
    mockGit.checkIsRepo.mockResolvedValue(true);
    const result = await gitHandler.isGitRepo('/path');
    expect(result).toBe(true);
    expect(simpleGit).toHaveBeenCalledWith(expect.objectContaining({ baseDir: '/path' }));
  });

  it('should get remote URL', async () => {
    mockGit.getRemotes.mockResolvedValue([{ name: 'origin', refs: { fetch: 'git@github.com:test/repo.git' } }]);
    const url = await gitHandler.getRemoteUrl('/path');
    expect(url).toBe('git@github.com:test/repo.git');
  });

  it('should clone a repo', async () => {
    mockGit.clone.mockResolvedValue(undefined);
    await gitHandler.clone('https://github.com/repo.git', '/path/target');
    expect(mockGit.clone).toHaveBeenCalledWith('https://github.com/repo.git', '/path/target');
  });

  it('should create a branch', async () => {
    mockGit.checkoutLocalBranch.mockResolvedValue(undefined);
    await gitHandler.createBranch('/path', 'new-branch');
    expect(mockGit.checkoutLocalBranch).toHaveBeenCalledWith('new-branch');
  });

  it('should checkout a branch', async () => {
    mockGit.checkout.mockResolvedValue(undefined);
    await gitHandler.checkout('/path', 'existing-branch');
    expect(mockGit.checkout).toHaveBeenCalledWith('existing-branch');
  });

  it('should get diff', async () => {
    mockGit.diff.mockResolvedValue('diff content');
    const diff = await gitHandler.diff('/path');
    expect(diff).toBe('diff content');
  });

  it('should commit changes', async () => {
    mockGit.add.mockResolvedValue(undefined);
    mockGit.commit.mockResolvedValue(undefined);
    await gitHandler.commit('/path', 'test commit');
    expect(mockGit.add).toHaveBeenCalledWith('.');
    expect(mockGit.commit).toHaveBeenCalledWith('test commit');
  });

  it('should push changes', async () => {
    mockGit.branch.mockResolvedValue({ current: 'main' });
    mockGit.push.mockResolvedValue(undefined);
    await gitHandler.push('/path');
    expect(mockGit.push).toHaveBeenCalledWith('origin', 'main', ['-u']);
  });
});
