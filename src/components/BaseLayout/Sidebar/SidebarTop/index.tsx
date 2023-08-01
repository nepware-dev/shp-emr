import { t } from '@lingui/macro';
import { Button, Menu } from 'antd';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';

import menuIcon from 'src/icons/general/menu.svg';
import encountersIcon from 'src/icons/menu/encounters.svg';
import patientsIcon from 'src/icons/menu/patients.svg';
import practitionersIcon from 'src/icons/menu/practitioners.svg';
import questionnairesIcon from 'src/icons/menu/questionnaires.svg';
import logo from 'src/images/logo.svg';
import { Role, matchCurrentUserRole } from 'src/utils/role';

import s from './SidebarTop.module.scss';

export interface RouteItem {
    path: string;
    exact?: boolean;
    label: string;
    icon?: React.ReactElement;
    disabled?: boolean;
    className?: string;
}

interface Props {
    collapsed: boolean;
    toggleCollapsed: () => void;
}

export function SidebarTop(props: Props) {
    const location = useLocation();
    const { collapsed, toggleCollapsed } = props;

    const menuItems: RouteItem[] = matchCurrentUserRole({
        [Role.Admin]: () => [
            { label: t`Encounters`, path: '/encounters', icon: <img src={encountersIcon} alt="" /> },
            { label: t`Patients`, path: '/patients', icon: <img src={patientsIcon} alt="" /> },
            { label: t`Practitioners`, path: '/practitioners', icon: <img src={practitionersIcon} alt="" /> },
            { label: t`Questionnaires`, path: '/questionnaires', icon: <img src={questionnairesIcon} alt="" /> },
        ],
        [Role.Patient]: () => [],
    });

    const activeMenu = `/${location.pathname.split('/')[1]}`;

    return (
        <div
            className={classNames(s.container, {
                _collapsed: collapsed,
            })}
        >
            <div className={s.sidebarTopContent}>
                <Button
                    icon={<img src={menuIcon} alt="" />}
                    className={s.collapseButton}
                    type="default"
                    onClick={toggleCollapsed}
                />
                <Link to="/" className={s.logoWrapper}>
                    <img src={logo} className={s.logoSmall} alt="" />
                    <img src={logo} className={s.logoCompanyName} alt="" />
                </Link>
            </div>
            <div className={s.divider} />
            <Menu
                mode="inline"
                theme="light"
                selectedKeys={[activeMenu!]}
                items={renderTopMenu(menuItems)}
                className={s.menu}
                inlineCollapsed={collapsed}
            />
        </div>
    );
}

function renderTopMenu(menuRoutes: RouteItem[]) {
    return menuRoutes.map((route) => ({
        key: route.path,
        label: (
            <Link to={route.path} className={s.menuLink}>
                <div className={s.menuLinkRow}>
                    {route.icon ? route.icon : null}
                    <span className={s.menuItemLabel}>{route.label}</span>
                </div>
                <span className={classNames(s.menuItemLabel, s._small)}>{route.label}</span>
            </Link>
        ),
        className: s.menuItem,
    }));
}
