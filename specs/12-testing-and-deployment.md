# Testing Strategy & Deployment

```typescript
// __tests__/unit/workspace-manager.test.ts

import { WorkspaceManager } from '@/backend/workspace-manager';
import Database from 'better-sqlite3';

describe('WorkspaceManager', () => {
  let db: Database.Database;
  let manager: WorkspaceManager;

  beforeEach(() => {
    db = new Database(':memory:');
    // Apply schema
    manager = new WorkspaceManager(db);
  });

  it('should create a workspace', async () => {
    const workspace = await manager.createWorkspace({
      repoId: 'repo-1',
      name: 'Feature - Auth',
      createdFrom: 'main',
    });

    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('Feature - Auth');
    expect(workspace.status).toBe('active');
  });

  it('should list workspaces for a repo', async () => {
    await manager.createWorkspace({
      repoId: 'repo-1',
      name: 'WS1',
      createdFrom: 'main',
    });

    await manager.createWorkspace({
      repoId: 'repo-1',
      name: 'WS2',
      createdFrom: 'main',
    });

    const workspaces = await manager.listWorkspaces('repo-1');
    expect(workspaces).toHaveLength(2);
  });
```

it('should archive a workspace', async () => {
const workspace = await manager.createWorkspace({
repoId: 'repo-1',
name: 'WS',
createdFrom: 'main',
});

    await manager.archiveWorkspace(workspace.id);

    const archived = await manager.getWorkspace(workspace.id);
    expect(archived.status).toBe('archived');

});
});

````

### Integration Tests

```typescript
// __tests__/integration/workspace-flow.test.ts

import { BackendService } from '@/backend/service';

describe('Workspace Flow', () => {
  let backend: BackendService;

  beforeEach(async () => {
    backend = new BackendService();
    await backend.start(3334); // Use different port for tests
  });

  afterEach(async () => {
    await backend.stop();
  });

  it('should complete full workspace workflow', async () => {
    // 1. Create workspace
    const workspace = await backend.createWorkspace({
      repoId: 'test-repo',
      name: 'Test Workspace',
      createdFrom: 'main',
    });

    // 2. Create agent
    const agent = await backend.createAgent(workspace.id, {
      name: 'Test Agent',
    });

    expect(agent.workspaceId).toBe(workspace.id);
    expect(agent.status).toBe('idle');
````

    // 3. Start agent
    await backend.startAgent(agent.id);

    // 4. Execute script
    const result = await backend.executeScript(
      workspace.id,
      'run'
    );

    expect(result.exitCode).toBeDefined();

    // 5. Get diff
    const diff = await backend.getDiff(workspace.id);
    expect(diff).toBeDefined();

    // 6. Create PR
    const pr = await backend.createPR(workspace.id, {
      title: 'Test PR',
      body: 'Test body',
    });

    expect(pr).toBeDefined();

});
});

````

### Build Configuration

```json
{
  "build": {
    "win": {
      "target": [
        "nsis",
        "portable"
      ]
    },
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "category": "public.app-category.developer-tools"
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ]
    },
    "publish": {
      "provider": "github",
      "owner": "your-org",
      "repo": "kiro-conductor"
    }
  }
}
````

### CI/CD Workflow

```yaml
# .github/workflows/release.yml

name: Release

on:
    push:
        tags:
            - "v*"

jobs:
    build:
        runs-on: ${{ matrix.os }}
        strategy:
            matrix:
                os: [ubuntu-latest, windows-latest, macos-latest]

        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: "18"

            - run: npm ci
            - run: npm run build
            - run: npm run electron:build

            - uses: softprops/action-gh-release@v1
              with:
                  files: |
                      dist/**/*.dmg
                      dist/**/*.exe
                      dist/**/*.AppImage
```
