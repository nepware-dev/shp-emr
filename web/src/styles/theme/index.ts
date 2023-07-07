import { theme as ANTDTheme, ThemeConfig } from 'antd';

import { colors, getPalette } from './palette';

export function getANTDTheme(): ThemeConfig {
    const palette = getPalette();

    return {
        token: {
            colorPrimary: colors.primary,
            colorLink: colors.link,
            colorLinkHover: palette.primaryPalette.cp_5,
            colorLinkActive: palette.primaryPalette.cp_7,
            colorError: colors.error,
            colorSuccess: colors.success,
            colorWarning: colors.warning,
            colorInfo: palette.primaryPalette.cp_6,
        },
        algorithm: ANTDTheme.defaultAlgorithm,
        components: {
            Layout: {
                colorBgHeader: '#fff',
                colorBgBody: palette.primaryPalette.cp_1,
            },
        },
    };
}
