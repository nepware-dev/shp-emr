import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button, Empty, notification } from 'antd';
import Title from 'antd/es/typography/Title';
import { Practitioner } from 'fhir/r4b';
import { useNavigate } from 'react-router-dom';

import { isLoading, isSuccess } from 'fhir-react/lib/libs/remoteData';

import { questionnaireIdLoader } from 'shared/src/hooks/questionnaire-response-form-data';

import { BasePageContent, BasePageHeader } from 'src/components/BaseLayout';
import { ModalTrigger } from 'src/components/ModalTrigger';
import { QuestionnaireResponseForm } from 'src/components/QuestionnaireResponseForm';
import { SearchBar } from 'src/components/SearchBar';
import { useSearchBar } from 'src/components/SearchBar/hooks';
import { StringTypeColumnFilterValue } from 'src/components/SearchBar/types';
import { SpinIndicator } from 'src/components/Spinner';
import { Table } from 'src/components/Table';

import { usePractitionersList } from './hooks';

export function PractitionerList() {
    const navigate = useNavigate();
    const { columnsFilterValues, onChangeColumnFilter, onResetFilters } = useSearchBar({
        columns: [
            {
                id: 'practitioner',
                type: 'string',
                placeholder: t`Search by name`,
            },
        ],
    });

    const { practitionerDataListRD, practitionerListReload, pagination, handleTableChange } = usePractitionersList(
        columnsFilterValues as StringTypeColumnFilterValue[],
    );

    return (
        <>
            <BasePageHeader style={{ paddingTop: 16, paddingBottom: 16 }}>
                <Title style={{ fontSize: 24, marginBottom: 0 }}>
                    <Trans>Practitioners</Trans>
                </Title>
            </BasePageHeader>
            <BasePageContent style={{ paddingTop: 88 }}>
                <SearchBar
                    columnsFilterValues={columnsFilterValues}
                    onChangeColumnFilter={onChangeColumnFilter}
                    onResetFilters={onResetFilters}
                />
                <ModalTrigger
                    title={t`Create practitioner`}
                    trigger={
                        <Button icon={<PlusOutlined />} type="primary" style={{ marginLeft: 'auto' }}>
                            <span>
                                <Trans>Add new practitioner</Trans>
                            </span>
                        </Button>
                    }
                >
                    {({ closeModal }) => (
                        <QuestionnaireResponseForm
                            questionnaireLoader={questionnaireIdLoader('practitioner-create')}
                            onSuccess={() => {
                                practitionerListReload();
                                closeModal();
                                notification.success({
                                    message: t`Practitioner successfully created`,
                                });
                            }}
                            onCancel={closeModal}
                        />
                    )}
                </ModalTrigger>
                <Table
                    pagination={pagination}
                    onChange={handleTableChange}
                    bordered
                    locale={{
                        emptyText: (
                            <>
                                <Empty description={<Trans>No data</Trans>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </>
                        ),
                    }}
                    dataSource={isSuccess(practitionerDataListRD) ? practitionerDataListRD.data : []}
                    columns={[
                        {
                            title: <Trans>Name</Trans>,
                            dataIndex: 'practitionerName',
                            key: 'practitionerName',
                            width: '20%',
                        },
                        {
                            title: <Trans>Specialty</Trans>,
                            dataIndex: 'practitionerRoleList',
                            key: 'practitionerRoleList',
                            width: '30%',
                            render: (specialties: string[]) => specialties.join(', '),
                        },
                        {
                            title: <Trans>Actions</Trans>,
                            dataIndex: 'practitionerResource',
                            key: 'actions',
                            width: '5%',
                            render: (practitioner: Practitioner) => {
                                return (
                                    <Button
                                        type="link"
                                        style={{ padding: 0 }}
                                        onClick={() =>
                                            navigate(`/practitioners/${practitioner.id}`, {
                                                state: { practitioner },
                                            })
                                        }
                                    >
                                        <Trans>Open</Trans>
                                    </Button>
                                );
                            },
                        },
                    ]}
                    loading={isLoading(practitionerDataListRD) && { indicator: SpinIndicator }}
                />
            </BasePageContent>
        </>
    );
}
