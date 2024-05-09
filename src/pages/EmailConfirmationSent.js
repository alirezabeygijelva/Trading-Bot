import React from 'react'
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { accountServices } from '../services/AccountServices';
import mail from '../assets/images/mail.png';
import '../assets/scss/EmailConfirmationSent.scss';

const EmailConfirmationSent = () => {
    const toast = React.useRef(null);
    const location = useLocation();
    const [loading, setLoading] = React.useState(false);

    const onClick = () => {
        setLoading(true);
        const values = queryString.parse(location.search);
        accountServices.sendConfirmationEmail(values?.email)
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
                        toast.current.show({ severity: 'success', summary: 'Email sent successfully', life: 3000 });
        setLoading(false);
    }
                }
            });
    }

    return (
        <div id='emailConfirmationSent-container'>
            <Toast ref={toast} />
            <div className="flex h-full align-content-center justify-content-center flex-wrap">
                <div className="text-center" style={{ flexBasis: '100%' }}>
                    <img src={mail} alt="mail" />
                </div>
                <h2 className="text-center mt-5" style={{ flexBasis: '100%' }}>Email confirmation has been sent, please check your email.</h2>
                <h4 className="text-center mt-5" style={{ flexBasis: '100%' }}>No email in your inbox or spam folder? Let's resend it</h4>
                <Button label="Resend email" className='my-2 p-button-raised p-button-success' onClick={onClick} loading={loading} />
            </div>
        </div >
    );
}

export default EmailConfirmationSent;

