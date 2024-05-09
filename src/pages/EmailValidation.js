import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { accountServices } from '../services/AccountServices';
import confirmEmail from '../assets/images/email-validation-confirmed.png';
import rejectEmail from '../assets/images/email-validation-rejected.png';
import '../assets/scss/EmailValidate.scss';

const EmailValidate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [isSucceed, setIsSucceed] = React.useState(false);
    const location = useLocation();

    const onClick = () => {
        navigate('/financemanagement');
    }

    React.useEffect(() => {
        const values = queryString.parse(location.search)
        if (values?.q) {
            accountServices.validateEmail(values.q).then(response => {
                if (response) {
                    if (Array.isArray(response)) {
                        setIsSucceed(false);
                    } else {
                        setIsSucceed(true);
                    }
                } else {
                    setIsSucceed(false);
                }
                setLoading(false);
            });
        } else {
            setIsSucceed(false);
            setLoading(false);
        }

    }, [location])

    if (loading) {
        return (
            <div id='email-validate-container' className="flex h-full align-content-center justify-content-center flex-wrap">
                <h2 className="text-center" style={{ flexBasis: '100%' }}>Checking your email, please wait...</h2>
                <ProgressSpinner />
            </div>
        );
    } else {
        if (isSucceed) {
            return (
                <div id='email-validate-container' className="flex h-full align-content-center justify-content-center flex-wrap">
                    <div className="text-center" style={{ flexBasis: '100%' }}>
                        <img src={confirmEmail} alt="confirmEmail" />
                    </div>
                    <h3 className="text-center" style={{ flexBasis: '100%' }}>Your email has been confirmed</h3>
                    <h3 className="text-center" style={{ flexBasis: '100%' }}>To complete the process please click
                        <Button label="Here" className='p-button-link text-3xl px-1 py-0' onClick={onClick} />
                    </h3>
                </div>
            );
        } else {
            return (
                <div id='email-validate-container' className="flex h-full align-content-center justify-content-center flex-wrap">
                    <div className="text-center" style={{ flexBasis: '100%' }}>
                        <img src={rejectEmail} alt="error" />
                    </div>
                    <h3 className="text-center" style={{ flexBasis: '100%' }}>There was an error while confirming your email, please try again.</h3>
                </div>
            );
        }
    }
}

export default EmailValidate;

