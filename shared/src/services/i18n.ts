import { i18n } from '@lingui/core';
import { en } from 'make-plural/plurals';

import { messages as enMessages } from '../locale/en/messages';

const localMap = {
    en: enMessages,
};

export const locales = {
    en: 'English',
};

i18n.loadLocaleData({
    en: { plurals: en },
});

export const getCurrentLocale = () => {
    return localStorage.getItem('locale') || 'en';
};

export const setCurrentLocale = (locale: string) => {
    localStorage.setItem('locale', locale);
};

export function dynamicActivate(locale: string) {
    const messages = localMap[locale];
    if (messages) {
        i18n.load(locale, messages);
    }
    i18n.activate(locale);
}
