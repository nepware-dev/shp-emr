import { t } from '@lingui/macro';
import { Button, Segmented } from 'antd';
import queryString from 'query-string';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AppFooter } from 'src/components/BaseLayout/Footer';
import logo from 'src/images/logo.svg';
import { getAuthorizeUrl, OAuthState } from 'src/services/auth';

import s from './SignIn.module.scss';

enum SignInService {
    EMR = 'EMR',
    PatientPortal = 'Patient Portal',
}

function authorize(state?: OAuthState) {
    window.location.href = getAuthorizeUrl(state);
}

interface SignInProps {
    originPathName?: string;
}

export function SignIn(props: SignInProps) {
    const [signInService, setSignInService] = useState<string>(SignInService.EMR);

    const location = useLocation();
    const queryParams = queryString.parse(location.search);

    return (
        <div className={s.container}>
            <div className={s.form}>
                <div className={s.header}>
                    <img src={logo} alt="" />
                </div>
                {Boolean(queryParams.error) && <div className={s.alert}>{queryParams.error_description}</div>}
                <Segmented
                    value={signInService}
                    options={[SignInService.EMR, SignInService.PatientPortal]}
                    block
                    onChange={(value) => setSignInService(value as SignInService)}
                    className={s.signInServiceSelectLabel}
                />
                <div className={s.message}>
                    <b>{t`On the next page, please, use the following credentials`}</b>
                    <div>
                        {t`Username`}: {signInService === SignInService.EMR ? 'admin' : 'patient'} <br />
                        {t`Password`}: password
                    </div>
                </div>
                <Button
                    type="primary"
                    onClick={() =>
                        authorize({
                            nextUrl: '/auth',
                            loginType: signInService === SignInService.EMR ? 'provider' : 'patient',
                        })
                    }
                    size="large"
                >
                    {signInService === SignInService.EMR ? t`Log in as Practitioner` : t`Log in as Patient`}
                </Button>
            </div>
            <AppFooter type="light" />
        </div>
    );
}
