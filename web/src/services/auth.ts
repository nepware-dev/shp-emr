import { setInstanceToken as setFHIRInstanceToken } from 'fhir-react/lib/services/instance';
import { decodeJwt } from 'jose';

import { setInstanceToken as setAidboxInstanceToken } from 'aidbox-react/lib/services/instance';
import { service } from 'aidbox-react/lib/services/service';
import { Token } from 'aidbox-react/lib/services/token';

import config from 'shared/src/config';
import { User } from 'shared/src/contrib/aidbox';

import { encode } from './codec';

interface ResponseAuthState {
    token_type: 'Bearer';
    access_token: string;
    /**
     * Lifetime in seconds of the access token, after which the token SHALL
     * NOT be accepted by the resource server
     */
    expires_in?: number;
    /**
     * Scope of access authorized. Note that this can be different from the
     * scopes requested by the app.
     */
    scope: string;
    /**
     * Token that can be used to obtain a new access token, using the same
     * or a subset of the original authorization grants. If present, the
     * app should discard any previous refresh_token associated with this
     * launch and replace it with this new value.
     */
    refresh_token?: string;
}
export type LocalAuthState = ResponseAuthState & { expires_at?: Date };

export interface OAuthState {
    nextUrl?: string;
    loginType?: 'patient' | 'provider';
}

export function parseOAuthState(state?: string): OAuthState {
    try {
        return state ? JSON.parse(atob(state)) : {};
    } catch {}

    return {};
}

export function formatOAuthState(state: OAuthState) {
    return btoa(JSON.stringify(state));
}

const DEFAULT_LAUNCH_PARAMS = {
    launch_type: 'provider-ehr',
    patient: '',
    provider: '',
    encounter: 'AUTO',
    skip_login: false,
    skip_auth: false,
    sim_ehr: false,
    scope: 'patient/*.* user/*.* launch launch/patient launch/encounter openid fhirUser profile offline_access',
    redirect_uris: '',
    client_id: 'whatever',
    client_secret: '',
    client_type: 'public',
    pkce: 'auto',
};

export function getAuthorizeUrl(state?: OAuthState) {
    //const stateStr = state ? `&state=${formatOAuthState(state)}` : '';
    const audStr = `&aud=${config.baseURL}/fhir`;
    const originURL = new URL(window.location.origin);
    const redirectUriStr = state ? `&redirect_uri=${originURL.origin}${state.nextUrl}` : '';

    const baseURL = new URL(config.baseURL);

    const launchParams = encode({
        ...DEFAULT_LAUNCH_PARAMS,
        launch_type: state?.loginType === 'provider' ? 'provider-ehr' : 'patient-portal',
    });
    const launchStr = `&launch=${launchParams}`;

    const loginType = state?.loginType || 'provider';

    const scopeStr =
        loginType === 'patient'
            ? `&scope=patient/*.*+openid+profile+fhirUser+offline_access`
            : `&scope=user/*.*+openid+profile+fhirUser+offline_access`;

    return `${baseURL.origin}/${loginType}-login?login_type=${loginType}&client_id=${config.clientId}&response_type=code${redirectUriStr}${audStr}${launchStr}${scopeStr}`;
}

export function getToken() {
    const authState = JSON.parse(window.localStorage.getItem('auth') || '{}') as LocalAuthState;
    return authState.access_token;
}

export function getRefreshToken() {
    const authState = JSON.parse(window.localStorage.getItem('auth') || '{}') as LocalAuthState;
    return authState.refresh_token;
}

export function getAuthState() {
    const authState = window.localStorage.getItem('auth');
    if (authState) {
        return JSON.parse(authState) as LocalAuthState;
    }
    return undefined;
}

export function setAuthState(authState: ResponseAuthState) {
    const tokenValidityDuration = authState.expires_in;
    const localAuthState = { ...authState } as LocalAuthState;
    if (tokenValidityDuration) {
        const now = new Date();
        localAuthState.expires_at = new Date(now.getTime() + tokenValidityDuration * 1000);
    }
    window.localStorage.setItem('auth', JSON.stringify(localAuthState));
    return localAuthState;
}

export function removeAuthState() {
    window.localStorage.removeItem('auth');
}

interface LoginBody {
    email: string;
    password: string;
}

type TokenResponse = {
    userinfo: User;
} & Token;

export async function getAccessTokenFromCode(code: string, nextUrl: string) {
    const originURL = new URL(window.location.origin);
    const redirectUriStr = `${originURL.origin}${nextUrl}`;

    const data = new URLSearchParams();
    data.append('code', code);
    data.append('redirect_uri', redirectUriStr);
    data.append('grant_type', 'authorization_code');

    return await service<any>({
        baseURL: config.baseURL,
        method: 'POST',
        url: '/auth/token/',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data,
    });
}

export async function getAccessTokenUsingRefreshToken(refreshToken: string) {
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refreshToken);

    return await service<any>({
        baseURL: config.baseURL,
        method: 'POST',
        url: '/auth/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data,
    });
}

export async function login(data: LoginBody) {
    return await service<TokenResponse>({
        baseURL: config.baseURL,
        url: '/auth/token',
        method: 'POST',
        data: {
            username: data.email,
            password: data.password,
            client_id: 'testAuth',
            client_secret: '123456',
            grant_type: 'password',
        },
    });
}

export function logout() {
    return service({
        baseURL: config.baseURL,
        method: 'DELETE',
        url: '/Session',
    });
}

export function getUserInfo() {
    return service<User>({
        baseURL: config.baseURL,
        method: 'GET',
        url: '/auth/userinfo',
    });
}

export async function getJitsiAuthToken() {
    return service<{ jwt: string }>({
        baseURL: config.baseURL,
        method: 'POST',
        url: '/auth/$jitsi-token',
    });
}

export async function signinWithIdentityToken(
    user: { firstName: string; lastName: string } | undefined,
    identityToken: string,
) {
    // setToken(identityToken);
    setAidboxInstanceToken({ access_token: identityToken, token_type: 'Bearer' });
    setFHIRInstanceToken({ access_token: identityToken, token_type: 'Bearer' });

    return await service({
        method: 'POST',
        url: '/Questionnaire/federated-identity-signin/$extract',
        data: {
            resourceType: 'Parameters',
            parameter: [
                {
                    name: 'FederatedIdentity',
                    value: {
                        Identifier: {
                            system: decodeJwt(identityToken).iss,
                            value: decodeJwt(identityToken).sub,
                        },
                    },
                },
                {
                    name: 'questionnaire_response',
                    resource: {
                        resourceType: 'QuestionnaireResponse',
                        questionnaire: 'federated-identity-signin',
                        item: [
                            {
                                linkId: 'firstname',
                                answer: [{ valueString: user?.firstName }],
                            },
                            {
                                linkId: 'lastname',
                                answer: [{ valueString: user?.lastName }],
                            },
                        ],
                    },
                },
            ],
        },
    });
}
