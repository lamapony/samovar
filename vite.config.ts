import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';

function getAllHtmlFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    files.forEach((file: string) => {
        const filePath = resolve(dir, file);
        if (statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') {
                getAllHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// @ts-ignore
const root = resolve(process.cwd());
const htmlFiles = getAllHtmlFiles(root);

const input: { [key: string]: string } = {};
htmlFiles.forEach((file) => {
    const relativePath = file.replace(root + '/', '');
    const name = relativePath.replace(/\.html$/, '').replace(/\//g, '_');
    input[name] = file;
});

export default defineConfig({
    root,
    build: {
        outDir: 'dist',
        rollupOptions: {
            input,
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
