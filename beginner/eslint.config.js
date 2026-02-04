import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                Audio: 'readonly',
                localStorage: 'readonly',
                speechSynthesis: 'readonly',
                SpeechSynthesisUtterance: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                location: 'readonly',
                history: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                Promise: 'readonly',
                // Node/Vite globals
                __dirname: 'readonly',
                process: 'readonly'
            }
        },
        plugins: {
            prettier: prettier
        },
        rules: {
            'prettier/prettier': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-console': 'off'
        }
    },
    {
        ignores: ['dist/', 'node_modules/', '*.html']
    }
);
