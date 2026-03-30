import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distElectronDir = path.join(__dirname, 'dist', 'electron');

function walkAndRename(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkAndRename(filePath);
      } else if (file.endsWith('.js')) {
        const newPath = path.join(dir, file.replace(/\.js$/, '.cjs'));
        fs.renameSync(filePath, newPath);

        // Update imports if it's main.js
        if (file === 'main.js' && dir === distElectronDir) {
          let content = fs.readFileSync(newPath, 'utf8');
          content = content.replace(/\.js'/g, '.cjs\'').replace(/\.js"/g, '.cjs"');
          fs.writeFileSync(newPath, content);
        }
      }
    }
  }
}

walkAndRename(distElectronDir);
