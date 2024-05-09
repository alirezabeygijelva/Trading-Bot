import React from 'react';
import * as Yup from "yup";
import { accountServices } from '../services/AccountServices';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { useFormik } from 'formik';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import classNames from 'classnames';
import useTranslation from '../lib/localization';
import '../assets/scss/ChangePassword.scss';

export const ChangePassword = (props) => {
    const t = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const toast = React.useRef(null);

    const onHide = () => {
        props.displayFunc(false);
    }

    const updateSchema = Yup.object().shape({
        password: Yup.string()
            .required('Required', t("changePassword.validatePassword")),
        confirmPassword: Yup.string()
            .required('Required', t("changePassword.validateConfirmPassword")),
        oldPassword: Yup.string()
            .required('Required', t("changePassword.validateOldPassword")),
    });

    const formik = useFormik({
        initialValues: {
            oldPassword: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: updateSchema,
        validate: (data) => {
            let errors = {};
            if (data.confirmPassword !== data.password) {
                errors.confirmPassword = t("changePassword.validateMatchConfirmPassword");
            }

            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            accountServices.changePassword(data).then((response) => {
                if (response) {
                    if (Array.isArray(response)) {
                        toast.current.show(response.map(x => ({
                            severity: 'error',
                            detail: `${x}`,
                            life: 4000
                        })));
                        setLoading(false);
                    } else {
                        setLoading(false);
                        toast.current.show({
                            severity: 'success',
                            detail: t("changePassword.successMessage"),
                            life: 4000
                        });
                        formik.resetForm();
                    }
                }
            });
        }
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const passwordFooter = (
        <React.Fragment>
            <Divider />
            <p className="p-mt-2">{t("changePassword.suggestions")}</p>
            <ul className="p-pl-2 p-ml-2 p-mt-0" style={{ lineHeight: '1.5' }}>
                <li>{t("changePassword.suggestionOne")}</li>
                <li>{t("changePassword.suggestionTwo")}</li>
                <li>{t("changePassword.suggestionThree")}</li>
                <li>{t("changePassword.suggestionFour")}</li>
            </ul>
        </React.Fragment>
    );

    return (
        <Dialog header={t("changePassword.changePassword")} maximizable visible={props.displayState} style={{ width: '50vw' }} onHide={onHide} dismissableMask={true}>
            <Toast ref={toast} />
            <div className="change-password p-d-flex p-jc-center">
                <div className="card">
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password id="oldPassword" name="oldPassword" value={formik.values.oldPassword} onChange={formik.handleChange} toggleMask feedback={false}
                                    className={classNames({ 'p-invalid': isFormFieldValid('oldPassword') })} autoComplete="current-password" />
                                <label htmlFor="oldPassword" className={classNames({ 'p-error': isFormFieldValid('oldPassword') })}>{t("changePassword.currentPassword")}</label>
                            </span>
                            {getFormErrorMessage('oldPassword')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password id="password" name="password" value={formik.values.password} onChange={formik.handleChange} toggleMask
                                    className={classNames({ 'p-invalid': isFormFieldValid('password') })} footer={passwordFooter} autoComplete="new-password" />
                                <label htmlFor="password" className={classNames({ 'p-error': isFormFieldValid('password') })}>{t("changePassword.newPassword")}</label>
                            </span>
                            {getFormErrorMessage('password')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <Password id="confirmPassword" name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} toggleMask
                                    className={classNames({ 'p-invalid': isFormFieldValid('confirmPassword') })} />
                                <label htmlFor="confirmPassword" className={classNames({ 'p-error': isFormFieldValid('confirmPassword') })}>{t("changePassword.confirmNewPassword")}</label>
                            </span>
                            {getFormErrorMessage('confirmPassword')}
                        </div>

                        <Button type="submit" label={t("shared.save")} className="p-mt-2 p-button-success" loading={loading} />
                    </form>
                </div>
            </div>
        </Dialog>
    )
}