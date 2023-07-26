import { createRequire } from 'module';
import * as path from 'path';

import { lingui } from '@lingui/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);

export default defineConfig(({ command }) => ({
    server: {
        port: command === 'build' ? undefined : 3000,
    },
    plugins: [
        viteCommonjs(),
        react({
            babel: {
                plugins: ['macros'],
            },
        }),
        lingui(),
    ],
    define: {
        'process.env': {},
    },
    resolve: {
        alias: [
            { find: 'src', replacement: path.resolve(__dirname, './src/') },
            { find: 'shared', replacement: path.resolve(__dirname, './shared/') },
        ],
    },
    build: {
        commonjsOptions: {
            defaultIsModuleExports(id) {
                try {
                    const module = require(id);
                    if (module?.default) {
                        return false;
                    }
                    return 'auto';
                } catch (error) {
                    return 'auto';
                }
            },
            transformMixedEsModules: true,
        },
    },
}));
