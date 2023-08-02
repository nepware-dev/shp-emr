import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button, Col, Empty, Row } from 'antd';
import Title from 'antd/es/typography/Title';
import { ColumnsType } from 'antd/lib/table';
import { Questionnaire } from 'fhir/r4b';
import { Link } from 'react-router-dom';

import { isLoading, isSuccess } from 'fhir-react/lib/libs/remoteData';

import config from 'shared/src/config';

import { BasePageContent, BasePageHeader } from 'src/components/BaseLayout';
import { SearchBar } from 'src/components/SearchBar';
import { useSearchBar } from 'src/components/SearchBar/hooks';
import { StringTypeColumnFilterValue } from 'src/components/SearchBar/types';
import { SpinIndicator } from 'src/components/Spinner';
import { Table } from 'src/components/Table';

import { useQuestionnaireList } from './hooks';

const columns: ColumnsType<Questionnaire> = [
    {
        title: <Trans id="msg.QuestionnaireName">Name</Trans>,
        dataIndex: 'name',
        key: 'name',
        render: (_text, resource) => resource.title || resource.id,
    },

    {
        title: <Trans>Actions</Trans>,
        width: 500,
        dataIndex: 'actions',
        key: 'actions',
        render: (_text, resource) => {
            return (
                <Row wrap={false} align="middle">
                    <Col>
                        <Link to={`/questionnaires/${resource.id}/edit`}>
                            <Button type="link">
                                <Trans>Open</Trans>
                            </Button>
                        </Link>
                    </Col>
                    <Col>
                        <a
                            href={`${config.sdcIdeUrl}/${resource.id}?client=sdc-ide`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <Trans>Edit in SDC IDE</Trans>
                        </a>
                    </Col>
                </Row>
            );
        },
    },
];

export function QuestionnaireList() {
    const { columnsFilterValues, onChangeColumnFilter, onResetFilters } = useSearchBar({
        columns: [
            {
                id: 'questionnaire',
                type: 'string',
                placeholder: t`Find questionnaire`,
            },
        ],
    });

    const { pagination, questionnaireListRD, handleTableChange } = useQuestionnaireList(
        columnsFilterValues as StringTypeColumnFilterValue[],
    );

    return (
        <>
            <BasePageHeader style={{ paddingTop: 16, paddingBottom: 16 }}>
                <Title style={{ fontSize: 24, marginBottom: 0 }}>
                    <Trans>Questionnaires</Trans>
                </Title>
            </BasePageHeader>
            <BasePageContent style={{ paddingTop: 88 }}>
                <SearchBar
                    columnsFilterValues={columnsFilterValues}
                    onChangeColumnFilter={onChangeColumnFilter}
                    onResetFilters={onResetFilters}
                />
                <Link to="/questionnaires/builder" style={{ marginLeft: 'auto' }}>
                    <Button icon={<PlusOutlined />} type="primary">
                        <span>
                            <Trans>Add questionnaire</Trans>
                        </span>
                    </Button>
                </Link>
                <Table<Questionnaire>
                    pagination={pagination}
                    onChange={handleTableChange}
                    locale={{
                        emptyText: (
                            <>
                                <Empty description={<Trans>No data</Trans>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </>
                        ),
                    }}
                    rowKey={(p) => p.id!}
                    dataSource={isSuccess(questionnaireListRD) ? questionnaireListRD.data : []}
                    columns={columns}
                    loading={isLoading(questionnaireListRD) && { indicator: SpinIndicator }}
                />
            </BasePageContent>
        </>
    );
}
