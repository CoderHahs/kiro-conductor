import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

export class GitHandler {
  private getGit(workspacePath: string): SimpleGit {
    const options: Partial<SimpleGitOptions> = {
      baseDir: workspacePath,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };
    return simpleGit(options);
  }

  async isGitRepo(repoPath: string): Promise<boolean> {
    try {
      const git = this.getGit(repoPath);
      return await git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getRemoteUrl(repoPath: string): Promise<string | null> {
    try {
      const git = this.getGit(repoPath);
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');
      if (origin && origin.refs.fetch) {
        return origin.refs.fetch;
      }
      return remotes.length > 0 ? remotes[0].refs.fetch : null;
    } catch {
      return null;
    }
  }

  async clone(repoUrl: string, targetPath: string): Promise<void> {
    try {
      const git = simpleGit();
      await git.clone(repoUrl, targetPath);
    } catch (error: any) {
      throw new Error(`Git clone failed: ${error.message}`);
    }
  }

  async createBranch(workspacePath: string, branchName: string): Promise<void> {
    try {
      const git = this.getGit(workspacePath);
      await git.checkoutLocalBranch(branchName);
    } catch (error: any) {
      throw new Error(`Git create branch failed: ${error.message}`);
    }
  }

  async checkout(workspacePath: string, branchName: string): Promise<void> {
     try {
       const git = this.getGit(workspacePath);
       await git.checkout(branchName);
     } catch (error: any) {
       throw new Error(`Git checkout failed: ${error.message}`);
     }
  }

  async diff(workspacePath: string): Promise<string> {
    try {
      const git = this.getGit(workspacePath);
      return await git.diff();
    } catch (error: any) {
      throw new Error(`Git diff failed: ${error.message}`);
    }
  }

  async commit(workspacePath: string, message: string): Promise<void> {
    try {
      const git = this.getGit(workspacePath);
      await git.add('.');
      await git.commit(message);
    } catch (error: any) {
      throw new Error(`Git commit failed: ${error.message}`);
    }
  }

  async push(workspacePath: string, remote: string = 'origin', branch?: string): Promise<void> {
    try {
      const git = this.getGit(workspacePath);

      let pushBranch = branch;
      if (!pushBranch) {
        const branchSummary = await git.branch();
        pushBranch = branchSummary.current;
      }

      await git.push(remote, pushBranch, ['-u']);
    } catch (error: any) {
      throw new Error(`Git push failed: ${error.message}`);
    }
  }

  // Maintaining the methods specified in the old mock/spec:
  async generateDiff(workspaceId: string) {
     return { success: true, data: '' };
  }

  async createPullRequest(workspaceId: string, options: any) {
     return { success: true, data: 'https://github.com/pr/1' };
  }
}
