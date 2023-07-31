import { t } from '@lingui/macro';
import { Menu } from 'antd';
import { useContext, useMemo, useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

import { RouteItem } from 'src/components/BaseLayout/Sidebar/SidebarTop';
import Breadcrumbs from 'src/components/Breadcrumbs';
import { matchCurrentUserRole, Role } from 'src/utils/role';

import s from './PatientContentHeader.module.scss';
import { PatientHeaderContext } from '../PatientHeader/context';

export const PatientContentHeader = () => {
    const location = useLocation();
    const params = useParams<{ id: string }>();
    const { breadcrumbs } = useContext(PatientHeaderContext);

    const menuItems: RouteItem[] = useMemo(
        () => [
            { label: t`Overview`, path: `/patients/${params.id}` },
            { label: t`Encounters`, path: `/patients/${params.id}/encounters` },
            { label: t`Documents`, path: `/patients/${params.id}/documents` },
            { label: t`Wearables`, path: `/patients/${params.id}/wearables` },
            { label: t`Resources`, path: `/patients/${params.id}/resources` },
        ],
        [params.id],
    );

    const [currentPath, setCurrentPath] = useState(location?.pathname);

    useEffect(() => {
        setCurrentPath(location?.pathname);
    }, [location]);

    const renderMenu = () => {
        return (
            <Menu
                mode="horizontal"
                theme="light"
                selectedKeys={[currentPath.split('/').slice(0, 4).join('/')]}
                className={s.menu}
                items={menuItems.map((route) => ({
                    key: route.path,
                    label: <Link to={route.path}>{route.label}</Link>,
                }))}
            />
        );
    };

    return (
        <div className={s.container}>
            <Breadcrumbs
                className={s.breadcrumbs}
                crumbs={matchCurrentUserRole({
                    [Role.Admin]: () => breadcrumbs,
                    [Role.Patient]: () => breadcrumbs.slice(1),
                })}
            />
            {renderMenu()}
        </div>
    );
};
