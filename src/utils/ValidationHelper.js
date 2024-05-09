export const validationHelper = {
    validate
}

function validate(pattern, valueToValidate, allowEmpty, isCollection, collectionSeperator) {
    if (!pattern)
        return true;
    if (!valueToValidate) {
        if (allowEmpty)
            return true;
        return false;
    }

    if (isCollection) {
        const values = valueToValidate.split(collectionSeperator ?? ',');
        if (values.length <= 0)
            return false;
        for (let index = 0; index < values.length; index++) {
            const element = values[index];
            if (!validateText(pattern, element))
                return false;
        }
        return true;
    } else {
        return validateText(pattern, valueToValidate);
    }
};

function validateText(pattern, valueToValidate) {
    return new RegExp(pattern).test(valueToValidate);
};
