import { Layout } from 'antd';
import classNames from 'classnames';

import s from './Sidebar.module.scss';
import { SidebarBottom } from './SidebarBottom';
import { SidebarTop } from './SidebarTop';

const { Sider } = Layout;

export function AppSidebar(props: { collapsed: boolean; setCollapsed: (c: boolean) => void }) {
    const { collapsed, setCollapsed } = props;

    const collapsedWidth = 100;
    const width = 248;

    return (
        <div
            className={classNames(s.container, {
                _collapsed: collapsed,
            })}
            style={{ width: collapsed ? collapsedWidth : width }}
        >
            <Sider
                collapsible
                collapsed={collapsed}
                className={s.sidebar}
                collapsedWidth={collapsedWidth}
                width={width}
                trigger={null}
            >
                <div className={s.sidebarContent}>
                    <SidebarTop collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />
                    <SidebarBottom collapsed={collapsed} />
                </div>
            </Sider>
        </div>
    );
}
