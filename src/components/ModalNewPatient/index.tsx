import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button, notification } from 'antd';
import { QuestionnaireResponse } from 'fhir/r4b';

import { questionnaireIdLoader } from 'shared/src/hooks/questionnaire-response-form-data';

import { ModalTrigger } from '../ModalTrigger';
import { QuestionnaireResponseForm } from '../QuestionnaireResponseForm';

interface ModalNewPatientProps {
    onCreate: () => void;
    triggerButtonStyle?: React.CSSProperties;
}

const initialResponse: Partial<QuestionnaireResponse> = {
  "resourceType": "QuestionnaireResponse",
  "id": "example-response",
  "questionnaire": "Questionnaire/496511",
  "status": "completed",
  "item": [
    {
        "linkId": "patient-id",
    },
    {
        "linkId": "last-name"
    },
    {
        "linkId": "first-name"
    },
    {
        "linkId": "middle-name"
    },
    {
        "linkId": "birth-date"
    },
    {
        "linkId": "gender"
    },
    {
        "linkId": "ssn"
    },
    {
        "linkId": "mobile"
    }
  ]
};

export const ModalNewPatient = (props: ModalNewPatientProps) => {
    return (
        <ModalTrigger
            title={t`Add patient`}
            trigger={
                <Button icon={<PlusOutlined />} type="primary" style={props.triggerButtonStyle}>
                    <span>
                        <Trans>Add patient</Trans>
                    </span>
                </Button>
            }
        >
            {({ closeModal }) => (
                <QuestionnaireResponseForm
                    questionnaireLoader={questionnaireIdLoader('496511')}
                    onSuccess={() => {
                        closeModal();
                        notification.success({ message: t`Patient successfully created` });
                        props.onCreate();
                    }}
                    onCancel={closeModal}
                    // initialQuestionnaireResponse={initialResponse}
                />
            )}
        </ModalTrigger>
    );
};
