import { t } from '@lingui/macro';
import { Button, Segmented } from 'antd';
import queryString from 'query-string';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import bannerScreen from 'src/images/banner-screen.png';
import logo from 'src/images/logo.svg';
import stethoscope from 'src/images/stethoscope.svg';
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
            <div className={s.authContent}>
                <div className={s.logoContainer}>
                    <img src={logo} alt="" />
                </div>
                <div className={s.form}>
                    <div className={s.header}>
                        <h1 className={s.title}>Welcome to Smart Health EMR Platform</h1>
                        <p className={s.description}>
                            Securely login to your EMR account with ease. Click the 'Login' button below to log in to
                            your account.
                        </p>
                    </div>
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
                    {Boolean(queryParams.error) && <div className={s.alert}>{queryParams.error_description}</div>}
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
            </div>
            <div className={s.banner}>
                <h2 className={s.bannerTitle}>Protecting your privacy while improving care</h2>
                <img src={stethoscope} alt="" />
                <img className={s.bannerImage} src={bannerScreen} alt="" />
            </div>
        </div>
    );
}
