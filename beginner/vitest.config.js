import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['js/**/*.test.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['js/modules/**/*.{js,ts}']
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './js'),
            '@modules': resolve(__dirname, './js/modules')
        }
    }
});
