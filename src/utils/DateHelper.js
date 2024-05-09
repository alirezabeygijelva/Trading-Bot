import { isInteger } from "formik";
import { isNumber } from "lodash";

export const dateHelper = {
    formatDate,
    getEpoch,
    considerAsUTCUnix,
    considerAsUTC,
    considerAsLocal,
    utcEpochSecondsToDate
}

function formatDate(value) {
    if (value) {
        var date = value.toString().length <= 11 ? new Date(value * 1000) : new Date(value);
        return date.toLocaleString('en-GB', { timeZone: 'UTC' });
    }
    return '';
}

function getEpoch(date) {
    if (date) {
        let time = date.getTime() + date.getTimezoneOffset() * 60000;
        return (time - (time % 1000)) / 1000;
    }
    return null;
}

function considerAsUTCUnix(date) {
    if (!date?.getMonth || typeof date.getMonth !== "function") {
        date = new Date(date);
        if (!date?.getMonth || typeof date.getMonth !== "function")
            throw new Error(`${date} is not a valid date`);
    }
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return Date.UTC(year, month, day, hour, minute, second) / 1000;
}

function considerAsUTC(date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function considerAsLocal(date) {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = date.getUTCSeconds();
    return new Date(year, month, day, hour, minute, second);
}
function utcEpochSecondsToDate(epoch) {
    if (epoch && isNumber(epoch)) {
        var date = new Date(epoch * 1000);
        return date;
    }
    return new Date();
}