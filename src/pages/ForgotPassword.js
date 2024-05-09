import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { accountServices } from '../services/AccountServices';
import { Captcha } from 'primereact/captcha';
import useTranslation from '../lib/localization';
import '../assets/scss/ForgotPassword.scss';

const ForgotPassword = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const formik = useFormik({
        initialValues: {
            email: '',
            captcha: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.email) {
                errors.email = t("forgotPassword.emailRequired");
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
                errors.email = t("forgotPassword.validateEmail");
            }

            if ((!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') && !captcha) {
                errors.captcha = t("forgotPassword.validateCaptcha");
            }
            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            accountServices.sendForgotPasswordEmail(data.email)
                .then(response => {
                    if (response) {
                        if (typeof response === 'string') {
                            setLoading(false);
                            toast.current.show({ severity: 'error', summary: t("forgotPassword.errorMessage"), detail: response, life: 5000 });
                        } else {
                            setLoading(false);
                            navigate({
                                pathname: '/forgotpasswordemailsent',
                                search: `?email=${data.email}`
                            });
                        }
                    }
                });
        }
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const onSuccessCaptcha = () => {
        setCaptcha(true);
    }

    const onExpireCaptcha = () => {
        setCaptcha(false);
    }

    return (
        <div id='forgot-password-container'>
            <Toast ref={toast} />
            <div className="flex justify-content-center mt-5">
                <div className="card">
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="p-field">
                            <span className="p-float-label p-input-icon-right">
                                <i className="pi pi-envelope" />
                                <InputText id="email" name="email" value={formik.values.email} onChange={formik.handleChange}
                                    autoFocus className={classNames({ 'p-invalid': isFormFieldValid('email') })} />
                                <label htmlFor="email" className={classNames({ 'p-error': isFormFieldValid('email') })}>{t("forgotPassword.email")}</label>
                            </span>
                            {getFormErrorMessage('email')}
                        </div>
                        {(!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') &&
                            <div className="p-field">
                                <Captcha siteKey={process.env.REACT_APP_CAPTCHA} onResponse={onSuccessCaptcha} onExpire={onExpireCaptcha} />
                                {getFormErrorMessage('captcha')}
                            </div>}
                        <div className="p-field text-center">
                            <Button label={t("forgotPassword.next")} type="submit" className='my-2 p-button-raised p-button-success' loading={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;