import { t } from '@lingui/macro';
import Title from 'antd/es/typography/Title';
import { Patient } from 'fhir/r4b';
import _ from 'lodash';
import { useContext, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { renderHumanName } from 'shared/src/utils/fhir';

import { BasePageHeader } from 'src/components/BaseLayout';

import { BreadCrumb, PatientHeaderContext } from './context';

export function PatientHeaderContextProvider(props: React.HTMLAttributes<HTMLDivElement> & { patient: Patient }) {
    const { children, patient } = props;
    const [pageTitle] = useState(renderHumanName(patient.name?.[0]));
    const params = useParams<{ id: string }>();
    const location = useLocation();
    const rootPath = useMemo(() => `/patients/${params.id}`, [params.id]);

    const [breadcrumbsMap, setBreadcrumbs] = useState({
        '/patients': t`Patients`,
        [rootPath]: renderHumanName(patient.name?.[0]),
    });

    const breadcrumbs: BreadCrumb[] = useMemo(() => {
        const isRoot = rootPath === location?.pathname;
        const paths = _.toPairs(breadcrumbsMap);

        const result = _.chain(paths)
            .map(([path, name]) => (location?.pathname.includes(path) ? [path, name] : undefined))
            .compact()
            .sortBy(([path]) => path)
            .map(([path, name]) => ({ path, name }))
            .value() as BreadCrumb[];

        return isRoot ? [...result, { name: 'Overview' }] : result;
    }, [location?.pathname, breadcrumbsMap, rootPath]);

    return (
        <PatientHeaderContext.Provider
            value={{
                title: pageTitle,
                breadcrumbs,
                setBreadcrumbs: (newPath) => {
                    const pathNames = breadcrumbs.map((b) => b.name);
                    const newPathName = _.toPairs(newPath)[0]?.[1];
                    if (newPathName && pathNames.includes(newPathName)) {
                        return;
                    }

                    setBreadcrumbs((prevValue) => ({
                        ...prevValue,
                        ...newPath,
                    }));
                },
            }}
        >
            {children}
        </PatientHeaderContext.Provider>
    );
}

export function PatientHeader() {
    const { title } = useContext(PatientHeaderContext);

    return (
        <BasePageHeader style={{ paddingBottom: 0 }}>
            <Title style={{ fontSize: 24, marginBottom: 0 }}>{title}</Title>
        </BasePageHeader>
    );
}
