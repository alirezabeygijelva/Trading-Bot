import React, { useRef } from 'react'
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { accountServices } from '../services/AccountServices';
import mail from '../assets/images/mail.png';
import useTranslation from '../lib/localization';
import '../assets/scss/ForgotPasswordEmailSent.scss';

const ForgotPasswordEmailConfirmationSent = () => {
    const t = useTranslation();
    const toast = useRef(null);
    const location = useLocation();

    const onClick = () => {
        const values = queryString.parse(location.search);
        accountServices.sendForgotPasswordEmail(values?.email)
            .then(response => {
                if (response) {
                    if (Array.isArray(response)) {
                        toast.current.show(response.map(x => ({
                            severity: 'error',
                            detail: `${x}`,
                            life: 5000
                        })));
                    } else {
                        toast.current.show({ severity: 'success', summary: t("forgotPasswordEmailSent.successMessage"), life: 3000 });
                    }
                }
            });
    }

    return (
        <div id='forgotPassword-emailSent-container'>
            <Toast ref={toast} />
            <div className="flex h-full align-content-center justify-content-center flex-wrap">
                <div className="text-center" style={{ flexBasis: '100%' }}>
                    <img src={mail} alt="mail" />
                </div>
                <h2 className="text-center mt-5" style={{ flexBasis: '100%' }}>{t("forgotPasswordEmailSent.confirmationText")}</h2>
                <h4 className="text-center mt-5" style={{ flexBasis: '100%' }}>{t("forgotPasswordEmailSent.noEmail")}</h4>
                <Button label={t("forgotPasswordEmailSent.resendEmail")} className='my-2 p-button-raised p-button-success' onClick={onClick} />
            </div>
        </div >
    );
}

export default ForgotPasswordEmailConfirmationSent;

