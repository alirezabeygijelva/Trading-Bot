import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { accountServices } from '../services/AccountServices';
import { ChangePassword } from "../components/ChangePassword"
import { UpdateProfile } from "./UpdateProfile"
import useTranslation from '../lib/localization';

export const Profile = (props) => {
    const t = useTranslation();
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(false);
    const [displayChangePass, setDisplayChangePass] = React.useState(false);
    const [displayProfile, setDisplayProfile] = React.useState(false);
    const [userInfo, setUserInfo] = React.useState(null);

    const onClick = (event) => {
        setExpanded(prevState => !prevState);
        event.preventDefault();
    }
    function logout() {
        accountServices.logout();
        navigate('/');
    }

    const onShow = () => {
        setDisplayChangePass(true);
    }

    const onShowProfile = () => {
        accountServices.getProfile().then((response) => {
            setUserInfo(response);
        });
        setDisplayProfile(true);
    }

    return (
        <React.Fragment>
            {!props.isIconSidebar && <div className="layout-profile flex flex-wrap justify-content-center">
                {/* <Avatar image={props.user?.avatar} icon={props.user?.avatar ? "" : "pi pi-user"} size="xlarge" shape="circle" className="mb-2" /> */}
                <button className="p-link layout-profile-link text-center" onClick={onClick}>
                    <span className="username">{props.user?.name}</span>
                    <i className="pi pi-fw pi-cog" />
                </button>
                <CSSTransition classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={expanded} unmountOnExit>
                    <ul className={classNames({ 'layout-profile-expanded': expanded })}>
                        <li>
                            <Button label={t("profile.profile")} icon="pi pi-fw pi-id-card" className="p-button p-button-text" onClick={onShowProfile} />
                        </li>
                        <li>
                            <Button label={t("profile.changePassword")} icon="pi pi-fw pi-key" className="p-button p-button-text" onClick={onShow} />
                        </li>
                        <li>
                            <Button label={t("profile.signOut")} icon="pi pi-sign-out" className="p-button p-button-danger p-button-text" onClick={logout} />
                        </li>
                    </ul>
                </CSSTransition>
            </div>}

            {props.isIconSidebar && <div className="layout-profile flex flex-wrap justify-content-center">
                <Avatar image={props.user?.avatar} icon={props.user?.avatar ? "" : "pi pi-user"} size="large" shape="circle" className="mb-2" onClick={onClick} />
                <CSSTransition classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={expanded} unmountOnExit>
                    <ul className={classNames({ 'layout-profile-expanded': expanded })}>
                        <li>
                            <Button icon="pi pi-fw pi-id-card" tooltip={t("profile.profile")} className="p-button p-button-danger p-button-text" onClick={onShowProfile} />
                        </li>
                        <li>
                            <Button icon="pi pi-fw pi-key" tooltip={t("profile.changePassword")} className="p-button p-button-danger p-button-text" onClick={onShow} />
                        </li>
                        <li>
                            <Button icon="pi pi-sign-out" tooltip={t("profile.signOut")} className="p-button p-button-danger p-button-text" onClick={logout} />
                        </li>
                    </ul>
                </CSSTransition>
            </div>}

            <ChangePassword displayState={displayChangePass} displayFunc={setDisplayChangePass} />
            <UpdateProfile displayState={displayProfile} displayFunc={setDisplayProfile} userInfo={userInfo} avatar={props.user?.avatar} />
        </React.Fragment>
    );

}