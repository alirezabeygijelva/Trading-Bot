import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { accountServices } from '../services/AccountServices';
import { Captcha } from 'primereact/captcha';
import useTranslation from '../lib/localization';
import '../assets/scss/Login.scss';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const t = useTranslation();
    const [captcha, setCaptcha] = useState(false);
    const [loading, setLoading] = useState(false);

    const toast = useRef(null);
    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            captcha: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.username) {
                errors.username = t("login.validateUserName");
            }

            if (!data.password) {
                errors.password = t("login.validatePassword");
            }

            if ((!process.env.NODE_ENV || (process.env.NODE_ENV !== 'development' && process.env.REACT_APP_ENV !== 'local')) && !captcha) {
                errors.captcha = t("login.validateCaptcha");
            }

            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            accountServices.login(data.username, data.password)
                .then(response => {
                    if (response) {
                        if (Array.isArray(response)) {
                            toast.current.show(response.map(x => ({
                                severity: 'error',
                                summary: t("login.errorSummary"),
                                detail: `${x}`,
                                life: 5000
                            })));
                            setLoading(false);
                        } else {
                            setLoading(false);
                            //DELETED FOR CLIENT VERSION
                            const { from } = location.state || { from: { pathname: "/financemanagement" } };
                            navigate(from);
                        }
                    }
                });
            const { from } = location.state || { from: { pathname: "/financemanagement" } };
            navigate(from);
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

    // const onRegisterClick = () => {
    //     navigate('/register')
    // }

    const onForgotClick = () => {
        navigate('/forgotpassword')
    }

    return (
        <div id="login-container">
            <Toast ref={toast} />
            <div className="flex justify-content-center mt-5">
                <div className="card">
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="username" name="username" value={formik.values.username} onChange={formik.handleChange}
                                    autoFocus className={classNames({ 'p-invalid': isFormFieldValid('username') })} autoComplete="username" />
                                <label htmlFor="username" className={classNames({ 'p-error': isFormFieldValid('username') })}>{t("login.userName")}</label>
                            </span>
                            {getFormErrorMessage('username')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password toggleMask id="password" name="password" value={formik.values.password} onChange={formik.handleChange} feedback={false}
                                    className={classNames({ 'p-invalid': isFormFieldValid('password') })} autoComplete="current-password" />
                                <label htmlFor="password" className={classNames({ 'p-error': isFormFieldValid('password') })}>{t("login.password")}</label>
                            </span>
                            {getFormErrorMessage('password')}
                        </div>
                        {(!process.env.NODE_ENV || (process.env.NODE_ENV !== 'development' && process.env.REACT_APP_ENV !== 'local')) &&
                            <div className="p-field">
                                <Captcha siteKey={process.env.REACT_APP_CAPTCHA} onResponse={onSuccessCaptcha} onExpire={onExpireCaptcha} />
                                {getFormErrorMessage('captcha')}
                            </div>}
                        <div className="p-field text-center">
                            <Button label={t("login.forgotPassword")} type="button" className="my-2 p-button-help p-button-text" onClick={onForgotClick} />
                            <Button label={t("login.login")} type="submit" className='my-2 p-button-raised p-button-success' loading={loading} />
                            {/* className='my-2 p-button-raised p-button-success' */}
                            {/* <Button label={t("login.register")} type="button" className='my-2 p-button-raised p-button-success p-button-text' onClick={onRegisterClick} /> */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;