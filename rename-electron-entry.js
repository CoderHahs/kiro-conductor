import fs from 'fs';
import path from 'path';

const distElectronDir = path.join(__dirname, 'dist', 'electron');

if (fs.existsSync(distElectronDir)) {
  const files = fs.readdirSync(distElectronDir);

  files.forEach((file) => {
    if (file.endsWith('.js')) {
      const oldPath = path.join(distElectronDir, file);
      const newPath = path.join(distElectronDir, file.replace(/\.js$/, '.cjs'));
      fs.renameSync(oldPath, newPath);
    }
  });
}
