import React from 'react';
import * as Yup from "yup";
import { accountServices } from '../services/AccountServices';
import { Dialog } from 'primereact/dialog';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import classNames from 'classnames';
import useTranslation from '../lib/localization';
import '../assets/scss/UpdateProfile.scss';

export const UpdateProfile = (props) => {
    const t = useTranslation();
    const [loading, setLoading] = React.useState(false);
    // const [uploadedAvatarUrl, setUploadedAvatarUrl] = React.useState(null);
    const toast = React.useRef(null);

    const onHide = () => {
        props.displayFunc(false);
    }

    React.useEffect(() => {
        updateFormik.setValues(props.userInfo ?? {
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: ''
        });
        // setUploadedAvatarUrl(props.avatar);
    }, [props.userInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateSchema = Yup.object().shape({
        firstName: Yup.string()
            .min(2).max(50)
            .required('Required', t("updateProfile.validateFirstName")),
        lastName: Yup.string()
            .min(2).max(50)
            .required('Required', t("updateProfile.validateLastName")),
        phoneNumber: Yup.string()
            .matches('^[+]?[0-9]+$', t("updateProfile.validatePhoneNumber")),
    });

    const updateFormik = useFormik({
        initialValues: {
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: ''
        },
        validationSchema: updateSchema,
        onSubmit: (data) => {
            setLoading(true);
            // accountServices.uploadAvatar(uploadedAvatarUrl).then((res) => {
            //     if (Array.isArray(res)) {
            //         toast.current.show(res.map(x => ({
            //             severity: 'error',
            //             detail: `${x}`,
            //             life: 4000
            //         })));
            //     }
            //     var avatarUrl = Array.isArray(res) ? null : res;
            accountServices.updateProfile(data, "").then((response) => {
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

                        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        if (currentUser) {
                            // currentUser.avatar = avatarUrl;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }

                        toast.current.show({
                            severity: 'success',
                            detail: t("updateProfile.successMessage"),
                            life: 4000
                        });
                    }
                }
            });
            // });
        }
    });

    const isUpdateFormFieldValid = (name) => !!(updateFormik.touched[name] && updateFormik.errors[name]);
    const getUpdateFormErrorMessage = (name) => {
        return isUpdateFormFieldValid(name) && <small className="p-error">{updateFormik.errors[name]}</small>;
    };

    // const onUpload = (ev) => {
    //     setUploadedAvatarUrl(ev.files[0]?.objectURL);
    // }

    return (
        <Dialog header={t("updateProfile.profile")} maximizable visible={props.displayState} style={{ width: '50vw' }} onHide={onHide} dismissableMask={true}>
            <Toast ref={toast} />
            <div className="update-profile p-d-flex p-jc-center">
                <div className="card">
                    <form onSubmit={updateFormik.handleSubmit} className="p-fluid">
                        <input type="hidden" value={updateFormik.values.email} />
                        {/* <div className="p-field flex align-items-center justify-content-around flex-wrap">
                            <div className="text-center">
                                <Avatar image={uploadedAvatarUrl} icon={uploadedAvatarUrl ? "" : "pi pi-user"} className="p-mr-2 w-8rem h-8rem mb-2" size="xlarge" shape="circle" />
                            </div>
                            <div>
                                <FileUpload name="demo[]" url="https://primefaces.org/primereact/showcase/upload.php" onUpload={onUpload} accept="image/*" maxFileSize={1000000}
                                    emptyTemplate={<p className="p-m-0">{t("updateProfile.fileUploadText")}</p>} />
                            </div>
                        </div> */}
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="username" name="username" value={updateFormik.values.username} onChange={updateFormik.handleChange} disabled className={classNames({ 'p-invalid': isUpdateFormFieldValid('username') })} />
                                <label htmlFor="username" className={classNames({ 'p-error': isUpdateFormFieldValid('username') })}>{t("updateProfile.userName")}</label>
                            </span>
                            {getUpdateFormErrorMessage('username')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="firstName" name="firstName" value={updateFormik.values.firstName} onChange={updateFormik.handleChange} autoFocus className={classNames({ 'p-invalid': isUpdateFormFieldValid('firstName') })} />
                                <label htmlFor="firstName" className={classNames({ 'p-error': isUpdateFormFieldValid('firstName') })}>{t("updateProfile.firstName")}</label>
                            </span>
                            {getUpdateFormErrorMessage('firstName')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputText id="lastName" name="lastName" value={updateFormik.values.lastName} onChange={updateFormik.handleChange} autoFocus className={classNames({ 'p-invalid': isUpdateFormFieldValid('lastName') })} />
                                <label htmlFor="lastName" className={classNames({ 'p-error': isUpdateFormFieldValid('lastName') })}>{t("updateProfile.lastName")}</label>
                            </span>
                            {getUpdateFormErrorMessage('lastName')}
                        </div>
                        <div className="p-field">
                            <span className="p-float-label p-input-icon-right">
                                <i className="pi pi-phone" />
                                <InputText id="phoneNumber" value={updateFormik.values.phoneNumber} onChange={updateFormik.handleChange} />
                                <label htmlFor="phoneNumber" className={classNames({ 'p-error': isUpdateFormFieldValid('phoneNumber') })}>{t("updateProfile.phoneNumber")}</label>
                            </span>
                            {getUpdateFormErrorMessage('phoneNumber')}
                        </div>

                        <Button type="submit" label={t("shared.save")} className="p-mt-2 p-button-success" loading={loading} />
                    </form>
                </div>
            </div>
        </Dialog>
    )
}