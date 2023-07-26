import { isSuccess, success } from 'fhir-react/lib/libs/remoteData';
import { getFHIRResource } from 'fhir-react/lib/services/fhir';
import {
    resetInstanceToken as resetFHIRInstanceToken,
    setInstanceToken as setFHIRInstanceToken,
} from 'fhir-react/lib/services/instance';
import { extractErrorCode, formatError } from 'fhir-react/lib/utils/error';
import { Patient, Practitioner } from 'fhir/r4b';

import * as aidboxReactRemoteData from 'aidbox-react/lib/libs/remoteData';
import {
    resetInstanceToken as resetAidboxInstanceToken,
    setInstanceToken as setAidboxInstanceToken,
} from 'aidbox-react/lib/services/instance';

import { User } from 'shared/src/contrib/aidbox';

import {
    getJitsiAuthToken,
    getUserInfo,
    getRefreshToken,
    getAccessTokenUsingRefreshToken,
    setAuthState,
    removeAuthState,
    type LocalAuthState,
} from 'src/services/auth';
import {
    sharedAuthorizedPatient,
    sharedAuthorizedPractitioner,
    sharedAuthorizedUser,
    sharedJitsiAuthToken,
} from 'src/sharedState';
import { Role, selectUserRole } from 'src/utils/role';

async function populateUserInfoSharedState(user: User) {
    sharedAuthorizedUser.setSharedState(user);

    const fetchUserRoleDetails = selectUserRole(user, {
        [Role.Admin]: async () => {
            const practitionerId = user.role![0]!.links!.practitioner!.id;
            const practitionerResponse = await getFHIRResource<Practitioner>({
                reference: `Practitioner/${practitionerId}`,
            });
            if (isSuccess(practitionerResponse)) {
                sharedAuthorizedPractitioner.setSharedState(practitionerResponse.data);
            } else {
                console.error(practitionerResponse.error);
            }
        },
        [Role.Patient]: async () => {
            const patientId = user.role![0]!.links!.patient!.id;
            const patientResponse = await getFHIRResource<Patient>({
                reference: `Patient/${patientId}`,
            });
            if (isSuccess(patientResponse)) {
                sharedAuthorizedPatient.setSharedState(patientResponse.data);
            } else {
                console.error(patientResponse.error);
            }
        },
    });
    await fetchUserRoleDetails();
}

export async function restoreUserSession(authState: LocalAuthState): Promise<any> {
    const { access_token: token, expires_at, refresh_token } = authState;
    if (refresh_token && expires_at) {
        const msToExpiry = +new Date(expires_at) - Date.now();
        if (msToExpiry <= 60000) {
            return refreshAccessToken(refresh_token);
        }
        if (!isNaN(msToExpiry)) {
            setTimeout(() => refreshAccessToken(refresh_token), msToExpiry - 60000);
        }
    }

    setAidboxInstanceToken({ access_token: token, token_type: 'Bearer' });
    setFHIRInstanceToken({ access_token: token, token_type: 'Bearer' });

    try {
        const userResponse = await getUserInfo();
        if (aidboxReactRemoteData.isSuccess(userResponse)) {
            await populateUserInfoSharedState(userResponse.data);

            const jitsiAuthTokenResponse = await getJitsiAuthToken();
            if (aidboxReactRemoteData.isSuccess(jitsiAuthTokenResponse)) {
                sharedJitsiAuthToken.setSharedState(jitsiAuthTokenResponse.data.jwt);
            }
            if (aidboxReactRemoteData.isFailure(jitsiAuthTokenResponse)) {
                console.warn('Error, while fetching Jitsi auth token: ', formatError(jitsiAuthTokenResponse.error));
            }
        } else {
            if (extractErrorCode(userResponse.error) === 'expired_token') {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    refreshAccessToken(refreshToken);
                } else {
                    resetInstanceTokens();
                    return success(null);
                }
            } else {
                return success(null);
            }
        }
        return userResponse;
    } catch (err) {
        resetInstanceTokens();
        return success(null);
    }
}

async function refreshAccessToken(refreshToken: string) {
    const refreshTokenResponse = await getAccessTokenUsingRefreshToken(refreshToken);
    if (isSuccess(refreshTokenResponse)) {
        const localAuthState = setAuthState(refreshTokenResponse.data);
        return restoreUserSession(localAuthState);
    } else {
        removeAuthState();
        resetInstanceTokens();
        return success(null);
    }
}

function resetInstanceTokens() {
    removeAuthState();

    resetAidboxInstanceToken();
    resetFHIRInstanceToken();
}
