import React from 'react';
import { scalpServices } from '../services/ScalpServices';
import { Dialog } from 'primereact/dialog';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { contentHelper } from '../utils/ContentHelper';

export const Note = (props) => {
    const [loading, setLoading] = React.useState(false);
    const [direction, setDirection] = React.useState('ltr');
    const toast = React.useRef(null);

    const onHide = () => {
        props.displayFunc(false);
    }

    const formik = useFormik({
        initialValues: {
            text: ''
        },
        validate: (data) => {
            let errors = {};
            if (data.text.trim().length < 5) {
                errors.text = 'The note must contain at least 5 characters'
            }
            return errors;
        },
        onSubmit: (data) => {
            setLoading(true);
            scalpServices.createNote(data).then((response) => {
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
                            detail: `Change password is successfully.`,
                            life: 4000
                        });
                        formik.resetForm();
                        props.displayFunc(false);
                    }
                }
            });
        }
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    React.useEffect(() => {
        if (contentHelper.isRTL(formik.values.text))
            setDirection("rtl");
        else
            setDirection("ltr")
    }, [formik.values.text])

    return (
        <Dialog header="Note" maximizable visible={props.displayState} style={{ width: '50vw' }} onHide={onHide} dismissableMask={true}>
            <Toast ref={toast} />
            <div className="p-d-flex p-jc-center">
                <div className="card">
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="p-field">
                            <span className="p-float-label">
                                <InputTextarea name="text" value={formik.values.text} rows={5} cols={60} autoFocus autoResize placeholder="Enter your note."
                                    onChange={formik.handleChange} style={{ direction: direction }} />
                            </span>
                            {getFormErrorMessage('text')}
                        </div>
                        <Button type="submit" label="Send" className="p-button-success" loading={loading} />
                    </form>
                </div>
            </div>
        </Dialog>
    )
}