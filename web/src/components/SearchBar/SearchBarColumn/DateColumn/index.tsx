import { Col } from 'antd';

import { DatePicker } from 'src/components/DatePicker';

import { SearchBarColumnDateTypeProps } from '../types';
import { useDateColumn } from './hooks';

const { RangePicker } = DatePicker;

export function DateColumn<T>(props: SearchBarColumnDateTypeProps) {
    const { columnFilterValue } = props;

    const { onColumnChange } = useDateColumn<T>(props);

    return (
        <Col>
            <RangePicker
                placeholder={columnFilterValue.column.placeholder}
                value={columnFilterValue.value}
                onChange={onColumnChange}
            />
        </Col>
    );
}
