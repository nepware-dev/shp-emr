import { LogoutOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import classNames from 'classnames';
import { useCallback } from 'react';

import { resetInstanceToken as resetAidboxInstanceToken } from 'aidbox-react/lib/services/instance';

import { resetInstanceToken as resetFHIRInstanceToken } from 'fhir-react/lib/services/instance';

import { logout } from 'src/services/auth';

import s from './SidebarBottom.module.scss';

interface MenuItem {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    children?: any[];
}

interface Props {
    collapsed: boolean;
}

export function SidebarBottom(props: Props) {
    const { collapsed } = props;

    return (
        <div
            className={classNames(s.container, {
                _collapsed: collapsed,
            })}
        >
            <div className={s.divider} />
            <LogoutMenu />
        </div>
    );
}

export function renderMenu(items: MenuItem[]): any[] {
    return items.map((item) => ({
        key: item.key,
        label: (
            <div className={s.menuItemContent}>
                {item.icon ? <div className={s.icon}>{item.icon}</div> : null}
                <span className={s.menuItemLabel}>{item.label}</span>
            </div>
        ),
        className: s.menuItem,
        children: item.children?.map((child) => ({
            ...child,
            className: s.submenuItem,
        })),
    }));
}

function LogoutMenu() {
    const doLogout = useCallback(async () => {
        await logout();
        resetAidboxInstanceToken();
        resetFHIRInstanceToken();
        localStorage.clear();
        window.location.href = '/';
    }, []);

    return (
        <div className={s.logoutLink} onClick={doLogout}>
            <div className={s.logoutIcon}>
                <LogoutOutlined />
            </div>
            <span className={s.logoutLabel}>{t`Logout`}</span>
        </div>
    );
}
