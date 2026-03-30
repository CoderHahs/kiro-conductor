# Package.json — Dependencies & Scripts

```json
{
    "name": "kiro-conductor",
    "version": "1.0.0",
    "description": "Cross-platform Conductor alternative using Kiro-CLI",
    "main": "dist/main.js",
    "homepage": "./",
    "type": "module",
    "scripts": {
        "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
        "dev:vite": "vite",
        "dev:electron": "wait-on http://localhost:3000 && electron .",
        "build": "npm run build:vite && npm run build:backend",
        "build:vite": "vite build",
        "build:backend": "esbuild src/backend/**/*.ts --bundle --platform=node --outdir=dist",
        "electron:build": "npm run build && electron-builder",
        "type-check": "tsc --noEmit",
        "lint": "eslint src --ext .ts,.tsx",
        "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
        "test": "jest",
        "test:coverage": "jest --coverage"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "zustand": "^4.4.0",
        "@tanstack/react-query": "^5.0.0",
        "tailwindcss": "^3.3.0",
        "@radix-ui/react-*": "^1.0.0",
        "xterm": "^5.3.0",
        "recharts": "^2.10.0",
        "react-hook-form": "^7.48.0",
        "zod": "^3.22.0",
        "lucide-react": "^0.294.0",
        "express": "^4.18.0",
        "socket.io": "^4.7.0",
        "better-sqlite3": "^9.2.0",
        "simple-git": "^3.20.0",
        "execa": "^8.0.0",
        "electron-store": "^8.5.0",
        "winston": "^3.11.0",
        "dotenv": "^16.3.0"
    },
    "devDependencies": {
        "electron": "^27.0.0",
        "electron-builder": "^24.6.0",
        "electron-updater": "^6.1.0",
        "@types/react": "^18.2.0",
        "@types/node": "^20.10.0",
        "typescript": "^5.3.0",
        "vite": "^5.0.0",
        "@vitejs/plugin-react": "^4.2.0",
        "esbuild": "^0.19.0",
        "eslint": "^8.55.0",
        "prettier": "^3.1.0",
        "jest": "^29.7.0",
        "ts-jest": "^29.1.0",
        "concurrently": "^8.2.0",
        "wait-on": "^7.0.0"
    }
}
```
