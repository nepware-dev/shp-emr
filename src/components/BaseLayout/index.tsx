// import { GlobalOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import classNames from 'classnames';
import { ReactNode, useCallback, useReducer, createContext } from 'react';

// import { dynamicActivate, setCurrentLocale, getCurrentLocale, locales } from 'shared/src/services/i18n';
import { renderHumanName } from 'shared/src/utils/fhir';

import { AvatarImage } from 'src/images/AvatarImage';
import { sharedAuthorizedPatient, sharedAuthorizedPractitioner } from 'src/sharedState';
import { Role, matchCurrentUserRole } from 'src/utils/role';

import s from './BaseLayout.module.scss';
import { useLayout } from './hooks';
// import { AppFooter } from './Footer';
import { AppSidebar } from './Sidebar';

interface Props {
    children: ReactNode;
    style?: React.CSSProperties;
}

export type LayoutType = {
    sidebarCollapsed: boolean;
};
export type LayoutAction = {
    type: 'setSidebarState';
    collapsed: boolean;
};

const initialLayout: LayoutType = { sidebarCollapsed: true };
export const LayoutContext = createContext<LayoutType>(initialLayout);
export const LayoutDispatchContext = createContext<React.Dispatch<LayoutAction>>(() => true);

function layoutReducer(layout: LayoutType, action: LayoutAction) {
    switch (action.type) {
        case 'setSidebarState':
            return { ...layout, sidebarCollapsed: action.collapsed };
        default:
            return layout;
    }
}

export const BaseLayoutProvider = ({ children }: { children: ReactNode }) => {
    const [layout, dispatch] = useReducer(layoutReducer, initialLayout);

    return (
        <LayoutContext.Provider value={layout}>
            <LayoutDispatchContext.Provider value={dispatch}>{children}</LayoutDispatchContext.Provider>
        </LayoutContext.Provider>
    );
};

export function BaseLayout({ children, style }: Props) {
    const [{ sidebarCollapsed: collapsed }, dispatchLayout] = useLayout();
    const setCollapsed = useCallback(
        (c: boolean) => {
            dispatchLayout({ type: 'setSidebarState', collapsed: c });
        },
        [dispatchLayout],
    );

    return (
        <Layout className={s.container} style={style}>
            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout className={s.content}>
                {children}
                {/*<AppFooter />*/}
            </Layout>
        </Layout>
    );
}

export function BasePageHeader(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, children, ...rest } = props;

    const [{ sidebarCollapsed: collapsed }] = useLayout();

    return (
        <div className={classNames(s.pageHeaderWrapper, { [s.pageHeaderWrapperCollapsed]: collapsed })}>
            <div className={classNames(s.pageHeader, className)} {...rest}>
                {children}
                <UserMenu />
            </div>
        </div>
    );
}

export function BasePageContent(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;

    return (
        <div className={s.pageContentWrapper}>
            <div className={classNames(s.pageContent, className)} {...rest} />
        </div>
    );
}

function PatientName() {
    const [patient] = sharedAuthorizedPatient.useSharedState();

    return <span>{renderHumanName(patient?.name?.[0])}</span>;
}

function AdminName() {
    const [practitioner] = sharedAuthorizedPractitioner.useSharedState();

    return <span>{renderHumanName(practitioner?.name?.[0])}</span>;
}

// function LocaleSwitcher() {
//     const currentLocale = getCurrentLocale();
//     const localesList = Object.entries(locales);
//     const items = localesList.map(([value, label]) => ({
//         label: <div>{label}</div>,
//         key: value,
//         onClick: () => onChangeLocale(value),
//     }));
//
//     const onChangeLocale = (key: string) => {
//         setCurrentLocale(key);
//         dynamicActivate(key);
//     };
//
//     return (
//         <Menu
//             mode="inline"
//             theme="light"
//             className={classNames(s.menu, s.localeMenu)}
//         />
//     );
// }

function UserMenu() {
    return (
        <div className={s.userMenu}>
            <AvatarImage />
            <>
                {matchCurrentUserRole({
                    [Role.Admin]: () => <AdminName />,
                    [Role.Patient]: () => <PatientName />,
                })}
            </>
        </div>
    );
}
