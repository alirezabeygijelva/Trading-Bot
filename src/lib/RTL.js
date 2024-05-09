import React from 'react';
import { LocalizationContext } from '../contexts/LocalizationContext';

export default function RTL(props) {
    const { direction, language } = React.useContext(LocalizationContext);
    React.useEffect(() => {
        if (direction === 'rtl') {
            document.body.style.fontFamily = 'IRANSansX_Regular';
        } else {
            document.body.style.fontFamily = 'Poppins_Light';
        }
    }, [direction])

    return (
        <div lang={language}>
            {props.children}
        </div >
    );
}