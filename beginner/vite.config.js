import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Automatically find all HTML files in the lessons directory
const lessonsDir = resolve(__dirname, 'lessons');
const lessonFiles = readdirSync(lessonsDir)
    .filter(file => file.endsWith('.html'))
    .reduce((acc, file) => {
        const name = file.replace('.html', '');
        acc[`lessons/${name}`] = resolve(lessonsDir, file);
        return acc;
    }, {});

export default defineConfig({
    root: '.',
    base: './',
    resolve: {
        alias: {
            // Map /js to parent studiru/js where shared components live
            '/js': resolve(__dirname, '../js')
        }
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'index-v2': resolve(__dirname, 'index-v2.html'),
                'srs-demo': resolve(__dirname, 'srs-demo.html'),
                ...lessonFiles
            }
        }
    },
    server: {
        port: 3000,
        open: '/index-v2.html',
        fs: {
            // Allow serving files from parent directory (studiru/js)
            allow: ['..']
        }
    }
});
