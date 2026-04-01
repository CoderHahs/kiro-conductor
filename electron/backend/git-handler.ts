export class GitHandler {
  async generateDiff(workspaceId: string) { return { success: true, data: '' }; }
  async createPullRequest(workspaceId: string, options: any) { return { success: true, data: 'https://github.com/pr/1' }; }
}
