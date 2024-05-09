import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { accountServices } from '../services/AccountServices';
import logo from '../assets/images/logo_main.png';
import mission from '../assets/images/our-mission.png';
import reason1 from '../assets/images/reason1.png';
import reason2 from '../assets/images/reason2.png';
import reason3 from '../assets/images/reason3.png';
import reason4 from '../assets/images/reason4.png';
import feature from '../assets/images/feature.png';
import useTranslation from '../lib/localization';
import { LocalizationContext } from '../contexts/LocalizationContext';
import '../assets/css/home/home.css';

const Home = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const { setLanguage, language, direction } = React.useContext(LocalizationContext);
    const toast = React.useRef(null);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const currentUser = accountServices.currentUserValue;

    const send = async () => {
        if (!name) {
            toast.current.show({ severity: 'error', summary: t("shared.error"), detail: t("landing.nameValidationError"), life: 3000 });
            return;
        }
        if (!email) {
            toast.current.show({ severity: 'error', summary: t("shared.error"), detail: t("landing.emailValidationError"), life: 3000 });
            return;
        }
        if (!message) {
            toast.current.show({ severity: 'error', summary: t("shared.error"), detail: t("landing.messageValidationError"), life: 3000 });
            return;
        }

        setLoading(true);
        accountServices.sendMessage(name, email, message)
            .then(response => {
                setLoading(false);
                if (response) {
                    if (Array.isArray(response)) {
                        toast.current.show({ severity: 'error', summary: t("shared.error"), detail: t("landing.errorOperationMessage"), life: 5000 });
                    } else {
                        toast.current.show({ severity: 'success', summary: t("shared.success"), detail: t("landing.successOperationMessage"), life: 3000 });
                        setName('');
                        setEmail('');
                        setMessage('');
                    }
                }
            });

    }

    var onLogInClick = (e) => {
        e.preventDefault();
        //DELETED FOR CLIENT VERSION
        navigate('/financemanagement');
    };

    // useEffect(() => {
    //     if (language === "fa") {
    //         document.getElementById("en-btn").classList.remove("active-lang");
    //         document.getElementById("fa-btn").classList.add("active-lang");
    //     } else {
    //         document.getElementById("fa-btn").classList.remove("active-lang");
    //         document.getElementById("en-btn").classList.add("active-lang");
    //     }
    // }, [language]);

    const onChangeLanguage = (selectedLanguage) => {
        if (setLanguage) {
            setLanguage(selectedLanguage);
        }
    }

    let getStarted;
    if (currentUser) {
        getStarted = <Button label={t('landing.btnDashboard')} className="p-button-info" type="button" onClick={onLogInClick} />
    } else {
        getStarted = <Button label={t('landing.btnGetStarted')} className="p-button-info" type="button" onClick={onLogInClick} />
    }

    return (
        <div id="home-container">
            <Toast ref={toast} />
            <header className="header">
                <div className="container">
                    <div className="grid">
                        <div className="md:col-6">
                            <div className="logo">
                                <img src={logo} alt="logo" className="logo-image" />
                            </div>
                        </div>
                        <div className="md:col-6 intro-container">
                            <div className="col-md-12 intro">
                                <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} intro-title`}>
                                    {t('landing.whyKaraBot')}
                                </div>
                                <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} intro-description`}>
                                    {t('landing.whyKaraBotDescription')}
                                </div>
                                <div className="mt-4">
                                    {getStarted}
                                </div>
                            </div>
                            <div className="w-full mt-5">
                                {/* <button className="btn fa-btn" id="fa-btn" title="فارسی" onClick={() => onChangeLanguage("fa")}></button> */}
                                <button className="btn en-btn active-lang" id="en-btn" title="English" onClick={() => onChangeLanguage("en")}></button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <section className="mission">
                <div className="container">
                    <div className="grid justify-content-around">
                        <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} md:col-6 sm:col-12 mission-container`}>
                            <div className="mission-text">
                                <span className="mission-title">{t("landing.mission")}</span>
                                <span className="mission-line"></span>
                                <div className="mission-description">
                                    <span>{t("landing.missionDescription")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-6 sm:col-12 mt-2">
                            <div className="mission-image">
                                <img src={mission} alt="our-mission" className="mission-pic img-fluid" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="reason">
                <div className="container flex">
                    <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} grid`}>
                        <div className="md:col-6 sm:col-12">
                            <div className="reason-title">
                                <div>
                                    <span className="reason-text">{t("landing.reason")}</span>
                                    <span className="reason-line"></span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-6 sm:col-12 flex align-items-stretch">
                            <div className="reason-info">
                                <div className="md:col-3 sm:col-12">
                                    <img src={reason1} alt="reason1" className="reason-image" />
                                    <div className="reason-description">
                                        <span>{t('landing.reasonOne')}</span>
                                    </div>
                                </div>
                                <div className="md:col-3 sm:col-12">
                                    <img src={reason2} alt="reason2" className="reason-image" />
                                    <div className="reason-description">
                                        <span>{t('landing.reasonTwo')}</span>
                                    </div>
                                </div>
                                <div className="md:col-3 sm:col-12">
                                    <img src={reason3} alt="reason3" className="reason-image" />
                                    <div className="reason-description">
                                        <span>{t('landing.reasonThree')}</span>
                                    </div>
                                </div>
                                <div className="md:col-3 sm:col-12">
                                    <img src={reason4} alt="reason4" className="reason-image" />
                                    <div className="reason-description">
                                        <span>{t('landing.reasonFour')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="feature">
                <div className="container flex">
                    <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} grid`}>
                        <div className="md:col-4 flex align-items-center">
                            <div className="feature-part">
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureOne')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureTwo')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureThree')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureFour')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureFive')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-4 flex align-items-center">
                            <div className="feature-title">
                                <span className="feature-text">{t('landing.feature')}</span>
                                <span className="feature-line"></span>
                                <img src={feature} alt="" className="img-fluid feature-image" />
                            </div>
                        </div>
                        <div className="md:col-4 flex align-items-center">
                            <div className="feature-part">
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureSix')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureSeven')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureEight')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureNine')}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="feature-shape"></span>
                                    <div className="feature-description">
                                        <span>{t('landing.featureTen')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="footer">
                <div className={`${direction === "ltr" ? "direction-ltr" : "direction-rtl"} container h-full relative`}>
                    <div className="grid">
                        <div className="md:col-6" style={{ margin: "0 auto" }}>
                            <div className="flex">
                                <div className="mb-4 pt-5" style={{ margin: "0 auto" }}>
                                    <span className="footer-text">{t('landing.contactUs')}</span>
                                    <span className="footer-line"></span>
                                </div>
                            </div>
                            <div className="formgrid grid">
                                <div className="field col">
                                    <InputText id="name" name="name" className="footer-item inputfield w-full"
                                        value={name} onChange={(e) => setName(e.target.value)} placeholder={t('landing.name')} />
                                </div>
                                <div className="field col">
                                    <InputText id="email" name="email" className="footer-item inputfield w-full"
                                        value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('landing.email')} />
                                </div>
                            </div>
                            <div className="mt-2 field">
                                <InputTextarea id="message" name="message" rows="5" className="footer-item inputfield w-full md-textarea"
                                    value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('landing.message')} />
                            </div>
                            <div className="mt-2">
                                <Button label={t('landing.submit')} type="submit" className='footer-button' loading={loading} onClick={send} />
                            </div>
                        </div>
                    </div>
                    <div className="copyright absolute bottom-0 w-full">
                        <div className="text-center text-white mb-2">
                            <span>{t('copyrightPartTwo')}<a href="https://www.karabot.ir" target="_blank" rel="noreferrer" style={{ color: '#0008ff' }}>{t('companyName')}</a>{t('copyrightPartOne')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;