import { t } from '@lingui/macro';
import { QuestionnaireResponse as FHIRQuestionnaireResponse } from 'fhir/r4b';
import _ from 'lodash';

import {
    QuestionnaireResponse as FCEQuestionnaireResponse,
    QuestionnaireResponseItem,
} from 'shared/src/contrib/aidbox';
import { toFirstClassExtension } from 'shared/src/utils/converter';

import { getDisplay } from 'src/utils/questionnaire';

import s from './ExternalDocumentView.module.scss';

interface Props {
    questionnaireResponse: FHIRQuestionnaireResponse;
}

interface Answer {
    linkId: string;
    text?: string;
    answer?: string | number;
}

function getAnswers(qr: FCEQuestionnaireResponse) {
    const collectAnswers = (qrItem: QuestionnaireResponseItem[]): Answer[] =>
        _.chain(qrItem)
            .map((item) => {
                const answer = { linkId: item.linkId, text: item.text };

                if (item.item) {
                    return [answer, ...collectAnswers(item.item)];
                }

                if (item.answer) {
                    return {
                        ...answer,
                        answer: item.answer.map((a) => getDisplay(a.value)).join(', '),
                    };
                }

                return answer;
            })
            .flattenDeep()
            .value();

    return collectAnswers(qr.item || []);
}

export function ExternalDocumentView(props: Props) {
    const { questionnaireResponse } = props;
    const e = questionnaireResponse._questionnaire?.extension?.find(
        ({ url }) => url === 'http://hl7.org/fhir/StructureDefinition/display',
    );
    const title = e?.valueString ?? t`Unknown`;
    const answers = getAnswers(toFirstClassExtension(questionnaireResponse));

    return (
        <div className={s.container}>
            <div className={s.content}>
                <div className={s.header}>
                    <h3 className={s.title}>{title}</h3>
                </div>
                <div>
                    {answers.map((answer) => {
                        if (answer.text && !answer.answer) {
                            return (
                                <div className={s.question} key={`question-${answer.linkId}`}>
                                    {answer.text}
                                </div>
                            );
                        }
                        if (answer.text || answer.answer) {
                            const isLongText = `${answer.text}${answer.answer}`.length > 60;

                            if (isLongText) {
                                return (
                                    <div className={s.question} key={`question-${answer.linkId}`}>
                                        <div>
                                            <b>{answer.text}</b>
                                        </div>
                                        <div className={s.rowAnswer}>{answer.answer}</div>
                                    </div>
                                );
                            }

                            return (
                                <div className={s.question} key={`question-${answer.linkId}`}>
                                    <div>
                                        <b>{answer.text}</b>
                                    </div>
                                    <div className={s.rowAnswer}>{answer.answer}</div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
