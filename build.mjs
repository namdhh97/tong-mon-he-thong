import { mkdir, copyFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await copyFile('public/nhiem-vu.html', 'dist/nhiem-vu.html');
await copyFile('public/nhiem-vu.html', 'dist/index.html');
