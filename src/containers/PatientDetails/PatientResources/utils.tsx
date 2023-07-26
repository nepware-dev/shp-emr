import { t } from '@lingui/macro';
import { WithId } from 'fhir-react/lib/services/fhir';
import {
    AllergyIntolerance,
    Condition,
    Consent,
    Immunization,
    MedicationStatement,
    Patient,
    Provenance,
    Resource,
} from 'fhir/r4b';
import { Link, useLocation } from 'react-router-dom';

import { extractExtension, fromFHIRReference } from 'shared/src/utils/converter';

import { formatHumanDate } from 'src/utils/date';

import { ResourceTable, Option } from './ResourceTable';

export function getOptions(patient: WithId<Patient>): Option[] {
    return [
        {
            value: 'medications',
            label: 'Medications',
            renderTable: (option: Option) => (
                <ResourceTable<MedicationStatement>
                    key={`resource-table-${option.value}`}
                    resourceType="MedicationStatement"
                    params={{
                        patient: patient.id,
                        _sort: ['-_lastUpdated'],
                        _revinclude: ['Provenance:target'],
                    }}
                    option={option}
                />
            ),
            getTableColumns: (provenanceList: Provenance[] = []) => [
                {
                    title: t`Name`,
                    key: 'name',
                    render: (resource: MedicationStatement) => (
                        <LinkToEdit
                            name={resource.medicationCodeableConcept?.coding?.[0]?.display}
                            resource={resource}
                            provenanceList={provenanceList}
                        />
                    ),
                },
                {
                    title: t`Dosage`,
                    key: 'date',
                    render: (r: MedicationStatement) => (r.dosage?.[0]?.text ? r.dosage?.[0]?.text : ''),
                    width: 200,
                },
                {
                    title: t`Status`,
                    key: 'status',
                    render: (r: MedicationStatement) => {
                        const readableStatus = (r.status || '').split('-').join(' ');
                        return readableStatus.charAt(0).toUpperCase() + readableStatus.slice(1);
                    },
                    width: 120,
                },
            ],
        },
        {
            value: 'conditions',
            label: 'Conditions',
            renderTable: (option: Option) => (
                <ResourceTable<Condition>
                    key={`resource-table-${option.value}`}
                    resourceType="Condition"
                    params={{
                        patient: patient.id,
                        _sort: ['-_lastUpdated'],
                        _revinclude: ['Provenance:target'],
                    }}
                    option={option}
                />
            ),
            getTableColumns: (provenanceList: Provenance[] = []) => [
                {
                    title: t`Name`,
                    key: 'name',
                    render: (resource: Condition) => (
                        <LinkToEdit
                            name={resource.code?.text || resource.code?.coding?.[0]?.display}
                            resource={resource}
                            provenanceList={provenanceList}
                        />
                    ),
                },
                {
                    title: t`Date`,
                    key: 'date',
                    render: (r: Condition) => {
                        return r.recordedDate ? formatHumanDate(r.recordedDate) : null;
                    },
                    width: 200,
                },
            ],
        },
        {
            value: 'allergies',
            label: 'Allergies',
            renderTable: (option: Option) => (
                <ResourceTable<AllergyIntolerance>
                    key={`resource-table-${option.value}`}
                    resourceType="AllergyIntolerance"
                    params={{
                        patient: patient.id,
                        _sort: ['-_lastUpdated'],
                        _revinclude: ['Provenance:target'],
                    }}
                    option={option}
                />
            ),
            getTableColumns: (provenanceList: Provenance[] = []) => [
                {
                    title: t`Name`,
                    key: 'name',
                    render: (resource: AllergyIntolerance) => (
                        <LinkToEdit
                            name={resource.code?.coding?.[0]?.display}
                            resource={resource}
                            provenanceList={provenanceList}
                        />
                    ),
                },
                {
                    title: t`Date`,
                    key: 'date',
                    render: (r: AllergyIntolerance) => {
                        const createdAt = extractExtension(r.meta?.extension, 'ex:createdAt');

                        return createdAt ? formatHumanDate(r.recordedDate || createdAt) : null;
                    },
                    width: 200,
                },
            ],
        },
        {
            value: 'immunization',
            label: 'Immunization',
            renderTable: (option: Option) => (
                <ResourceTable<Immunization>
                    key={`resource-table-${option.value}`}
                    resourceType="Immunization"
                    params={{
                        patient: patient.id,
                        _sort: ['-_lastUpdated'],
                        _revinclude: ['Provenance:target'],
                    }}
                    option={option}
                />
            ),
            getTableColumns: (provenanceList: Provenance[] = []) => [
                {
                    title: t`Name`,
                    key: 'name',
                    render: (resource: Immunization) => (
                        <LinkToEdit
                            name={resource.vaccineCode.coding?.[0]?.display}
                            resource={resource}
                            provenanceList={provenanceList}
                        />
                    ),
                },
                {
                    title: t`Date`,
                    key: 'date',
                    render: (r: Immunization) => (r.occurrenceDateTime ? formatHumanDate(r.occurrenceDateTime) : ''),
                    width: 200,
                },
            ],
        },
        {
            value: 'consents',
            label: 'Consents',
            renderTable: (option: Option) => (
                <ResourceTable<Consent>
                    key={`resource-table-${option.value}`}
                    resourceType="Consent"
                    params={{
                        patient: patient.id,
                        status: 'active',
                        _sort: ['-_lastUpdated'],
                        _revinclude: ['Provenance:target'],
                    }}
                    option={option}
                />
            ),
            getTableColumns: (provenanceList: Provenance[] = []) => [
                {
                    title: t`Name`,
                    key: 'name',
                    render: (resource: Consent) => (
                        <LinkToEdit
                            name={resource.provision?.data?.[0]?.reference.display}
                            resource={resource}
                            provenanceList={provenanceList}
                        />
                    ),
                    width: 200,
                },
                {
                    title: t`Date`,
                    key: 'date',
                    render: (r: Consent) => {
                        return r.dateTime ? formatHumanDate(r.dateTime) : null;
                    },
                    width: 100,
                },
                {
                    title: t`Practitioner`,
                    key: 'actor',
                    render: (r: Consent) => r.provision?.actor?.[0]?.reference.display,
                    width: 200,
                },
            ],
        },
    ];
}

export function LinkToEdit(props: { name?: string; resource: Resource; provenanceList: Provenance[] }) {
    const { name, resource, provenanceList } = props;
    const location = useLocation();
    const provenance = provenanceList.find(
        (p) =>
            fromFHIRReference(p.target[0])?.id === resource.id &&
            fromFHIRReference(p.target[0])?.resourceType === resource.resourceType,
    );
    const entity = provenance?.entity?.[0]?.what;
    const qrId = fromFHIRReference(entity)?.id;
    const pathname = location.pathname.split('/').slice(0, 3).join('/');

    if (qrId) {
        return <Link to={`${pathname}/documents/${qrId}`}>{name}</Link>;
    }

    return <>{name}</>;
}
