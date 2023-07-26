import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
    locales: ['en'],
    format: 'po',
    catalogs: [
        {
            path: 'shared/src/locale/{locale}/messages',
            include: ['<rootDir>'],
            exclude: ['**/node_modules/**'],
        },
    ],
};

export default config;
