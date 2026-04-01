import { BackendService } from './electron/backend/service.js';

async function main() {
  const b = new BackendService();
  await b.start(3333);
  console.log('Server started on port 3333');
}

main().catch(console.error);
