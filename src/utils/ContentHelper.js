export const contentHelper = {
    createMarkup,
    copy,
    copyColumn,
    parseJwt,
    isRTL,
    digitFormat
}

function createMarkup(text) { return {__html: text}; };

function copy(text) {
    navigator.clipboard.writeText(text).then(function () {
        console.log("Copied to clipboard successfully!");
    }, function () {
        console.error("Unable to write to clipboard. :-(");
    });
};

function copyColumn(context, field) {
    copy(context.map(e => e[field]).filter(f => f != null && f !== undefined && f !== '').join(","));
};

function parseJwt(token) {
    if (!token)
        return {};
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function isRTL(content) {
    var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
        rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

    return rtlDirCheck.test(content);
};

function digitFormat(content,precision) {
    return content.toLocaleString(undefined, { maximumFractionDigits: (precision===0 ? 0 : precision || 4) });
};