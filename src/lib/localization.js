import { useContext } from "react"
import { LocalizationContext } from '../contexts/LocalizationContext';

export const useLocalization = () => {
    return useContext(LocalizationContext);
}

export default function useTranslation() {
    const context = useContext(LocalizationContext);
    const { data } = context.supportedLanguages[context.language];
    return (key) => data[key] ?? key;
}