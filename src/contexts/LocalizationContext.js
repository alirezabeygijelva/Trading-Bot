import { createContext, useEffect, useState } from "react"
import en from '../resouces/en.json'
import fa from '../resouces/fa.json'

const supportedLanguages = {
    en: { data: en, name: "English", direction: 'ltr' },
    fa: { data: fa, name: "فارسی", direction: 'rtl' }
}

export const languageList = Object.entries(supportedLanguages)
    .map((values) => ({ code: values[0], name: values[1].name }));

export const LocalizationContext = createContext();

export function LocalizationProvider(props) {
    const [language, setLanguage] = useState('en');
    const [direction, setDirection] = useState('ltr');

    // useEffect(() => {
    //     let defaultLanguage = localStorage.getItem("language");
    //     if (!defaultLanguage)
    //         defaultLanguage = process.env.REACT_APP_LANGUAGE ?? "fa";
    //     setLanguage(defaultLanguage);
    //     setDirection(supportedLanguages[defaultLanguage].direction);
    // }, [])

    const handleLanguageChange = (nextLanguage) => {
        nextLanguage = nextLanguage == null || nextLanguage === 'null' || nextLanguage === undefined ? language : nextLanguage;

        if (nextLanguage) {
            setLanguage(nextLanguage);
            setDirection(supportedLanguages[nextLanguage].direction);
            window.localStorage.setItem("language", nextLanguage);
        }
    };

    return <LocalizationContext.Provider value={{
        language,
        setLanguage: handleLanguageChange,
        languageList: languageList,
        supportedLanguages,
        direction
    }}>
        {props.children}
    </LocalizationContext.Provider>
}

export default LocalizationProvider;