import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Captcha } from 'primereact/captcha';
import { accountServices } from '../services/AccountServices';
import '../assets/scss/Register.scss';

const Register = () => {
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            captcha: ''
        },
        validate: (data) => {
            let errors = {};

            if ((!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') && !captcha) {
                errors.captcha = 'Captcha is required.';
            }

            if (!data.firstname) {
                errors.firstname = 'Firstname is required.';
            }

            if (!data.lastname) {
                errors.lastname = 'Lastname is required.';
            }

            if (!data.username) {
                errors.username = 'Username is required.';
            }

            if (!data.email) {
                errors.email = 'Email is required.';
            }
            else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
                errors.email = 'Invalid email address. E.g. example@email.com';
            }

            if (!data.password) {
                errors.password = 'Password is required.';
            }

            if (!data.confirmPassword) {
                errors.confirmPassword = 'Confirm Password is required.';
            }

            if (data.password !== data.confirmPassword) {
                errors.confirmPassword = 'The password and confirmation password do not match.';
            }

            var regex = new RegExp('^[+]?[0-9]+$');
            if (!regex.test(data.phoneNumber)) {
                errors.phoneNumber = 'Invalid phone number.';
            }

            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            accountServices.register(data.firstname, data.lastname, data.username, data.email, data.password, data.phoneNumber)
                .then(response => {
                    if (response) {
                        if (Array.isArray(response)) {
                            toast.current.show(response.map(x => ({
                                severity: 'error',
                                detail: `${x}`,
                                life: 5000
                            })));
                            setLoading(false);
                        } else {
                            setLoading(false);
                            navigate({
                                pathname: '/emailconfirmationsent',
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

    const onLoginClick = () => {
        navigate('/login');
    }

    const onSuccessCaptcha = () => {
        setCaptcha(true);
    }

    const onExpireCaptcha = () => {
        setCaptcha(false);
    }

    return (
        <div id="register-container">
            <Toast ref={toast} />
            <div className="flex justify-content-center mt-4">
                <div className='card'>
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="firstname" name="firstname" value={formik.values.firstname} onChange={formik.handleChange}
                                    autoFocus className={classNames({ 'p-invalid': isFormFieldValid('firstname') })} autoComplete="given-name" />
                                <label htmlFor="firstname" className={classNames({ 'p-error': isFormFieldValid('firstname') })}>First Name *</label>
                            </span>
                            {getFormErrorMessage('firstname')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="lastname" name="lastname" value={formik.values.lastname} onChange={formik.handleChange}
                                    className={classNames({ 'p-invalid': isFormFieldValid('lastname') })} autoComplete="family-name" />
                                <label htmlFor="lastname" className={classNames({ 'p-error': isFormFieldValid('lastname') })}>Last Name *</label>
                            </span>
                            {getFormErrorMessage('lastname')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="username" name="username" value={formik.values.username} onChange={formik.handleChange}
                                    className={classNames({ 'p-invalid': isFormFieldValid('username') })} autoComplete="username" />
                                <label htmlFor="username" className={classNames({ 'p-error': isFormFieldValid('username') })}>Username *</label>
                            </span>
                            {getFormErrorMessage('username')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label p-input-icon-right">
                                <i className="pi pi-envelope" />
                                <InputText id="email" name="email" value={formik.values.email} onChange={formik.handleChange}
                                    className={classNames({ 'p-invalid': isFormFieldValid('email') })} autoComplete="email" />
                                <label htmlFor="email" className={classNames({ 'p-error': isFormFieldValid('email') })}>Email *</label>
                            </span>
                            {getFormErrorMessage('email')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password toggleMask id="password" name="password" value={formik.values.password} onChange={formik.handleChange}
                                    className={classNames({ 'p-invalid': isFormFieldValid('password') })} autoComplete="new-password" />
                                <label htmlFor="password" className={classNames({ 'p-error': isFormFieldValid('password') })}>Password *</label>
                            </span>
                            {getFormErrorMessage('password')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password toggleMask id="confirmPassword" name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} feedback={false}
                                    className={classNames({ 'p-invalid': isFormFieldValid('confirmPassword') })} />
                                <label htmlFor="confirmPassword" className={classNames({ 'p-error': isFormFieldValid('confirmPassword') })}>Confirm Password *</label>
                            </span>
                            {getFormErrorMessage('confirmPassword')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label p-input-icon-right">
                                <i className="pi pi-phone" />
                                <InputText id="phoneNumber" value={formik.values.phoneNumber} onChange={formik.handleChange} />
                                <label htmlFor="phoneNumber" className={classNames({ 'p-error': isFormFieldValid('phoneNumber') })}>Phone Number</label>
                            </span>
                            {getFormErrorMessage('phoneNumber')}
                        </div>
                        {(!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') &&
                            <div className="p-field">
                                <Captcha siteKey={process.env.REACT_APP_CAPTCHA} onResponse={onSuccessCaptcha} onExpire={onExpireCaptcha} />
                                {getFormErrorMessage('captcha')}
                            </div>}
                        <div className="p-field text-center">
                            <Button label="Register" type="submit" className='my-2 p-button-raised p-button-success' loading={loading} />
                            <Button label="Login" type="button" className='my-2 p-button-raised p-button-success p-button-text'
                                onClick={onLoginClick} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;