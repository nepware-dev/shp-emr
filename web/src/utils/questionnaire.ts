import * as yup from 'yup';

import {
    Questionnaire,
    QuestionnaireItemAnswerOption,
    QuestionnaireItemAnswerOptionValue,
} from 'shared/src/contrib/aidbox';

export function getDisplay(value?: QuestionnaireItemAnswerOptionValue): string | number | null {
    if (!value) {
        return null;
    }

    if (value.Coding) {
        return value.Coding.display ?? '';
    }

    if (value.string) {
        return value.string;
    }

    if (value.integer) {
        return value.integer;
    }

    console.warn(`There is not implementation for getDisplay of ${JSON.stringify(value)}`);

    return '';
}

export function getArrayDisplay(options?: QuestionnaireItemAnswerOption[]): string | null {
    if (!options) {
        return null;
    }

    return options.map((v: QuestionnaireItemAnswerOption) => getDisplay(v.value)).join(', ');
}

export function questionnaireToValidationSchema(questionnaire: Questionnaire) {
    const validationSchema: Record<string, yup.AnySchema> = {};
    if (questionnaire.item === undefined)
        return yup.object(validationSchema) as yup.AnyObjectSchema;
    questionnaire.item.forEach((item) => {
        if (item.type === 'string') {
            let stringSchema = yup.string();
            if (item.required) stringSchema = stringSchema.required();
            if (item.maxLength && item.maxLength > 0)
                stringSchema = stringSchema.max(item.maxLength);
            validationSchema[item.linkId] = createSchemaArray(
                yup.object({ string: stringSchema }),
            ).required() as unknown as yup.AnySchema;
        } else if (item.type === 'integer') {
            let numberSchema = yup.number();
            if (item.required) numberSchema = numberSchema.required();
            validationSchema[item.linkId] = createSchemaArray(
                yup.object({ integer: numberSchema }),
            ).required() as unknown as yup.AnySchema;
        } else {
            (validationSchema[item.linkId] as any) = item.required
                ? yup.mixed().required()
                : yup.mixed().nullable();
        }
    });
    return yup.object(validationSchema).required() as yup.AnyObjectSchema;
}

function createSchemaArray(value: yup.ObjectSchema<any>) {
    return yup.array().of(yup.object({ value }));
}
