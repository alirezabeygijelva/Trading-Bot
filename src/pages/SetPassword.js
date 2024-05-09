import React, { useRef, useState } from 'react';
import queryString from 'query-string';
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { accountServices } from '../services/AccountServices';
import useTranslation from '../lib/localization';
import '../assets/scss/SetPassword.scss';

const SetPassword = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const values = queryString.parse(location.search)
    const toast = useRef(null);
    const successToast = useRef(null);
    const formik = useFormik({
        initialValues: {
            //token
            q: values.q,
            password: '',
            confirmPassword: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.password) {
                errors.password = t("setPassword.validatePassword");
            }

            if (!data.confirmPassword) {
                errors.confirmPassword = t("setPassword.validateConfirmPassword");
            }

            if (data.password !== data.confirmPassword) {
                errors.confirmPassword = t("setPassword.validateMatchConfirmPassword");
            }

            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            accountServices.setPassword(data.q, data.password)
                .then(response => {
                    if (response) {
                        if (Array.isArray(response)) {
                            setLoading(false);
                            toast.current.show(response.map(x => ({
                                severity: 'error',
                                detail: `${x}`,
                                life: 5000
                            })));
                        } else {
                            setLoading(false);
                            successToast.current.show(
                                {
                                    severity: 'success',
                                    summary: t("setPassword.successMessage"),
                                    life: 3000
                                });
                        }
                    }
                });
        }
    });
    const onSuccessToastHide = () => {
        navigate('/login');
    };
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    return (
        <div id='setpassword-container'>
            <Toast ref={toast} />
            <Toast ref={successToast} onHide={onSuccessToastHide} />
            <div className="flex justify-content-center mt-5">
                <div className="card">
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <input type="hidden" id="q" name="q" value={formik.values.q} />
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password toggleMask id="password" name="password" value={formik.values.password} onChange={formik.handleChange}
                                    autoFocus className={classNames({ 'p-invalid': isFormFieldValid('password') })} autoComplete="new-password" />
                                <label htmlFor="password" className={classNames({ 'p-error': isFormFieldValid('password') })}>{t("setPassword.password")}</label>
                            </span>
                            {getFormErrorMessage('password')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password toggleMask id="confirmPassword" name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange}
                                    className={classNames({ 'p-invalid': isFormFieldValid('confirmPassword') })} feedback={false} />
                                <label htmlFor="confirmPassword" className={classNames({ 'p-error': isFormFieldValid('confirmPassword') })}>{t("setPassword.confirmPassword")}</label>
                            </span>
                            {getFormErrorMessage('confirmPassword')}
                        </div>
                        <div className="p-field text-center">
                            <Button label={t("shared.save")} type="submit" className='my-2 p-button-raised p-button-success' loading={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SetPassword;