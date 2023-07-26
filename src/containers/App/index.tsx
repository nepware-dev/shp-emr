import { Trans } from '@lingui/macro';
import { isSuccess } from 'fhir-react/lib/libs/remoteData';
import queryString from 'query-string';
import { useEffect, useRef, useCallback } from 'react';
import { Route, unstable_HistoryRouter as HistoryRouter, Routes, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { RenderRemoteData } from 'aidbox-react/lib/components/RenderRemoteData';
import { useService } from 'aidbox-react/lib/hooks/service';
import { success } from 'aidbox-react/lib/libs/remoteData';

import { User } from 'shared/src/contrib/aidbox';

import { BaseLayout } from 'src/components/BaseLayout';
import { Spinner } from 'src/components/Spinner';
import { PublicAppointment } from 'src/containers/Appointment/PublicAppointment';
import { EncounterList } from 'src/containers/EncounterList';
import { EncounterQR } from 'src/containers/EncounterQR';
import { PatientDetails } from 'src/containers/PatientDetails';
import { PatientList } from 'src/containers/PatientList';
import { PatientQuestionnaire } from 'src/containers/PatientQuestionnaire';
import { PractitionerDetails } from 'src/containers/PractitionerDetails';
import { PractitionerList } from 'src/containers/PractitionerList';
import { QuestionnaireBuilder } from 'src/containers/QuestionnaireBuilder';
import { QuestionnaireList } from 'src/containers/QuestionnaireList';
import { SignIn } from 'src/containers/SignIn';
import { VideoCall } from 'src/containers/VideoCall';
import { getAuthState } from 'src/services/auth';
import { parseOAuthState, setAuthState, getAccessTokenFromCode } from 'src/services/auth';
import { history } from 'src/services/history';
import { sharedAuthorizedPatient } from 'src/sharedState';
import { Role, matchCurrentUserRole } from 'src/utils/role';

import { restoreUserSession } from './utils';

export function App() {
    const [userResponse, { reload }] = useService(async () => {
        const appAuthState = getAuthState();
        return appAuthState ? restoreUserSession(appAuthState) : success(null);
    });

    const onVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'visible') {
            const appAuthState = getAuthState();
            if (appAuthState?.expires_at) {
                const msToExpiry = +new Date(appAuthState?.expires_at) - Date.now();
                if (msToExpiry <= 60000) {
                    reload();
                }
            }
        }
    }, [reload]);

    useEffect(() => {
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [onVisibilityChange]);

    const renderRoutes = (user: User | null) => {
        if (user) {
            try {
                return matchCurrentUserRole({
                    [Role.Admin]: () => <AuthenticatedAdminUserApp />,
                    [Role.Patient]: () => <AuthenticatedPatientUserApp />,
                });
            } catch (err) {
                console.log(err);
            }
        }

        return <AnonymousUserApp />;
    };

    return (
        <div data-testid="app-container">
            <RenderRemoteData remoteData={userResponse} renderLoading={Spinner}>
                {(user) => {
                    // @ts-expect-error Incompatible package
                    return <HistoryRouter history={history}>{renderRoutes(user)}</HistoryRouter>;
                }}
            </RenderRemoteData>
        </div>
    );
}

export function Auth() {
    const location = useLocation();

    useEffect(() => {
        async function getAccessToken(code: string) {
            try {
                const res = await getAccessTokenFromCode(code, '/auth');
                if (isSuccess(res)) {
                    setAuthState(res.data);
                }
                const state = parseOAuthState(queryParams.state as string | undefined);
                window.location.href = state.nextUrl ?? '/';
            } catch (err) {
                console.log(err);
                window.location.href = '/';
            }
        }

        const queryParams = queryString.parse(location.search);

        if (queryParams.error) {
            window.location.href = `/signin/${location.search}`;
        }

        if (queryParams.code) {
            getAccessToken(queryParams.code as string);
        }
    }, [location.search]);

    return null;
}

function AnonymousUserApp(_props: {}) {
    const location = useLocation();
    const originPathRef = useRef(location.pathname);

    return (
        <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/signin" element={<SignIn originPathName={originPathRef.current} />} />
            <Route
                path="/reset-password"
                element={
                    <div>
                        <Trans>Reset password</Trans>
                    </div>
                }
            />
            <Route
                path="/set-password/:code"
                element={
                    <div>
                        <Trans>Set password</Trans>
                    </div>
                }
            />
            <Route path="/appointment/book" element={<PublicAppointment />} />
            <Route path="/questionnaire" element={<PatientQuestionnaire />} />
            <Route
                path="*"
                element={
                    <>
                        <Navigate to="/signin" replace={true} />
                    </>
                }
            />
        </Routes>
    );
}

function AuthenticatedAdminUserApp(_props: {}) {
    return (
        <BaseLayout>
            <Routes>
                <Route path="/patients" element={<PatientList />} />
                <Route path="/encounters" element={<EncounterList />} />
                <Route path="/appointment/book" element={<PublicAppointment />} />
                <Route path="/questionnaire" element={<PatientQuestionnaire />} />
                <Route path="/patients/:id/*" element={<PatientDetails />} />
                <Route path="/documents/:id/edit" element={<div>documents/:id/edit</div>} />
                <Route path="/encounters/:encounterId/qr/:questionnaireId" element={<EncounterQR />} />
                <Route path="/encounters/:encounterId/video" element={<VideoCall />} />
                <Route path="/practitioners" element={<PractitionerList />} />
                <Route path="/practitioners/:id/*" element={<PractitionerDetails />} />
                <Route path="/questionnaires" element={<QuestionnaireList />} />
                <Route path="/questionnaires/builder" element={<QuestionnaireBuilder />} />
                <Route path="/questionnaires/:id/edit" element={<QuestionnaireBuilder />} />
                <Route path="/questionnaires/:id" element={<div>questionnaires/:id</div>} />
                <Route path="*" element={<Navigate to="/encounters" />} />
            </Routes>
        </BaseLayout>
    );
}

function AuthenticatedPatientUserApp(_props: {}) {
    const [patient] = sharedAuthorizedPatient.useSharedState();

    return (
        <BaseLayout>
            <Routes>
                <Route path={`/patients/:id/*`} element={<PatientDetails />} />
                <Route path="*" element={<Navigate to={`/patients/${patient!.id}`} />} />
            </Routes>
        </BaseLayout>
    );
}
