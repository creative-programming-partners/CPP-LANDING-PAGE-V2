// Copia a dist/ solo los archivos del sitio; Cloudflare publica esa carpeta (ver wrangler.jsonc).
import { cpSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
const RAIZ = /\.(html|css|js|txt|xml)$/;
const FUERA = new Set(['publicar.mjs']);
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const f of readdirSync('.')) if (RAIZ.test(f) && !FUERA.has(f)) cpSync(f, `dist/${f}`);
cpSync('assets', 'dist/assets', { recursive: true });
console.log('dist/ listo:', readdirSync('dist').join(', '));
