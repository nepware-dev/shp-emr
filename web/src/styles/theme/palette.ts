import * as ANTDColors from '@ant-design/colors';
import _ from 'lodash';

const root = document.querySelector(':root');
function getColorVariable(colorVariable: string) {
    if (root) {
        const rootStyles = getComputedStyle(root);
        return rootStyles.getPropertyValue(colorVariable);
    }
    return undefined;
}

const brandColors = {
    primary: (getColorVariable('--color-primary') || ANTDColors.blue.primary) as string,
    secondary: (getColorVariable('--color-secondary') || ANTDColors.red.primary) as string,
    background: (getColorVariable('--color-background') || ANTDColors.blue[0]) as string,
};

const semanticColors = {
    link: brandColors.primary,
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
};

const accentColors = {
    orange: '#FF6B35',
    // TODO: Add all accent colors. Also use proper names.
};

export const neutralColors = {
    text50: getColorVariable('--color-text-50') as string,
    text100: getColorVariable('--color-text-100') as string,
    text200: getColorVariable('--color-text-200') as string,
    text300: getColorVariable('--color-text-300') as string,
    text400: getColorVariable('--color-text-400') as string,
    text500: getColorVariable('--color-text-500') as string,
    text600: getColorVariable('--color-text-600') as string,
    text700: getColorVariable('--color-text-700') as string,
    text800: getColorVariable('--color-text-800') as string,
    text900: getColorVariable('--color-text-900') as string,
};

export const colors = {
    ...brandColors,
    ...semanticColors,
    ...accentColors,
    ...neutralColors,
    white: '#FFFFFF',
    black: '#000000',
};

export function getPalette() {
    return {
        ..._.chain(colors)
            .toPairs()
            .map(([name, color]) => [name, ANTDColors.generate(color)[5]])
            .fromPairs()
            .value(),
        accent: accentColors,
        neutral: neutralColors,
        primaryPalette: _.fromPairs(ANTDColors.generate(colors.primary).map((c, index) => [`cp_${index + 1}`, c])),
        secondaryPalette: _.fromPairs(ANTDColors.generate(colors.secondary).map((c, index) => [`cs_${index + 1}`, c])),
    };
}
