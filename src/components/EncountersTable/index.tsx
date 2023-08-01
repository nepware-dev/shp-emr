import { Trans } from '@lingui/macro';
import { Empty, TablePaginationConfig } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { isLoading, isSuccess, RemoteData } from 'fhir-react/lib/libs/remoteData';

import { EncounterData } from './types';
import { SpinIndicator } from '../Spinner';
import { Table } from '../Table';

interface EncountersTableProps {
    columns: ColumnsType<EncounterData>;
    remoteData: RemoteData<EncounterData[]>;
    handleTableChange: (pagination: TablePaginationConfig) => Promise<void>;
    pagination: {
        current: number;
        pageSize: number;
        total: number | undefined;
    };
}

export function EncountersTable(props: EncountersTableProps) {
    const encounterDataListRD = props.remoteData;

    return (
        <Table<EncounterData>
            locale={{
                emptyText: (
                    <>
                        <Empty description={<Trans>No data</Trans>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </>
                ),
            }}
            pagination={props.pagination}
            onChange={props.handleTableChange}
            rowKey={(record) => record.id}
            dataSource={isSuccess(encounterDataListRD) ? encounterDataListRD.data : []}
            columns={props.columns}
            loading={isLoading(encounterDataListRD) && { indicator: SpinIndicator }}
        />
    );
}
