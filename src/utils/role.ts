import { Patient as PatientResource, Practitioner } from 'fhir/r4b';
import { WithId } from 'fhir-react';

import { User } from 'shared/src/contrib/aidbox';

import { sharedAuthorizedPatient, sharedAuthorizedPractitioner, sharedAuthorizedUser } from 'src/sharedState';

export enum Role {
    Patient = 'patient',
    Admin = 'admin',
}

export function selectUserRole<T>(user: User, options: { [role in Role]: T }): T {
    const userRole = user.role![0]!.name;

    return options[userRole];
}

export function matchCurrentUserRole<T>(options: {
    [Role.Patient]: (patient: WithId<PatientResource>) => T;
    [Role.Admin]: (patient: WithId<Practitioner>) => T;
}): T {
    return selectUserRole(sharedAuthorizedUser.getSharedState()!, {
        [Role.Admin]: () => options[Role.Admin](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Patient]: () => options[Role.Patient](sharedAuthorizedPatient.getSharedState()!),
    })();
}

export function selectCurrentUserRoleResource(): WithId<PatientResource> | WithId<Practitioner> {
    return matchCurrentUserRole<WithId<PatientResource> | WithId<Practitioner>>({
        [Role.Admin]: (practitioner) => practitioner,
        [Role.Patient]: (patient) => patient,
    });
}
