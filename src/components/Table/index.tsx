import { Table as ANTDTable } from 'antd';
import { TableProps, TablePaginationConfig } from 'antd/lib/table';

import s from './Table.module.scss';

export function Table<T extends object>(props: TableProps<T>) {
    return (
        <div className={s.container}>
            <ANTDTable<T>
                className={s.table}
                bordered
                {...props}
                pagination={{
                    ...(props.pagination || {}),
                    showSizeChanger: ((props.pagination as TablePaginationConfig)?.total as number) > 10,
                }}
            />
        </div>
    );
}
