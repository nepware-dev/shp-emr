import { Col, Input } from 'antd';

import { SearchBarColumnStringTypeProps } from '../types';
import { useStringColumn } from './hooks';

export function StringColumn<T>(props: SearchBarColumnStringTypeProps) {
    const { columnFilterValue } = props;

    const { onColumnChange } = useStringColumn<T>(props);

    return (
        <Col>
            <Input.Search
                placeholder={columnFilterValue.column.placeholder}
                value={columnFilterValue.value}
                onChange={onColumnChange}
            />
        </Col>
    );
}
