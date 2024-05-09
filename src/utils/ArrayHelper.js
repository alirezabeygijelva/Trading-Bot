export const arrayHelper = {
    groupBy,
    findPeak,
    findOldPeak
}

function groupBy(array, key) {
    return array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        return result;
    }, {});
};
function findPeak(arrayObj, refObj) {
    var index = arrayObj.findIndex(macd => macd.x === refObj);
    if (index < 0)
        return refObj;
    let maxValue = arrayObj[index];
    const positive = maxValue.y >= 0;

    for (let i = index; i < arrayObj.length; i++) {
        const element = arrayObj[i];
        if ((positive && element.y < 0) || (!positive && element.y > 0))
            break;
        if (Math.abs(element.y) > Math.abs(maxValue.y))
            maxValue = element;
    }
    for (let i = index; i >= 0; i--) {
        const element = arrayObj[i];
        if ((positive && element.y < 0) || (!positive && element.y > 0))
            break;
        if (Math.abs(element.y) > Math.abs(maxValue.y))
            maxValue = element;
    }
    return maxValue.x;
}

function findOldPeak(arrayObj, refObj) {
    var index = arrayObj.findIndex(macd => macd.x === refObj);
    if (index < 0)
        return refObj;

    let maxValue = arrayObj[index];

    const positive = maxValue.y >= 0;

    for (let i = index; i >= 0; i--) {
        const element = arrayObj[i];
        if ((positive && element.y < 0) || (!positive && element.y > 0))
            break;
        if (Math.abs(element.y) > Math.abs(maxValue.y))
            maxValue = element;
    }
    return maxValue.x;
}