export const JsonHelper = {
    safeParse,
}

function safeParse(str) {
    if (typeof str !== 'string') return null;
    try {
        const result = str && JSON.parse(str);
        if (!result)
            return null;
        const type = Object.prototype.toString.call(result);
        if (type === '[object Object]' || type === '[object Array]')
            return result;
        return null;
    } catch (err) {
        return null;
    }
}
