import { dateHelper } from './DateHelper';

export const filterHelper = {
    filterDate,
    filterNumeric,
    filterText
}

function filterDate(value, filter) {
    if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return true;
    }

    if (value === undefined || value === null) {
        return false;
    }

    let from = filter[0];
    let to = filter[1];
    if (to == null) {
        to = from;
    }

    if (from == null || to == null) {
        return true;
    }

    return value >= dateHelper.considerAsUTCUnix(from) && value <= dateHelper.considerAsUTCUnix(to);
}

function filterNumeric(columnValue, filterValue, selectedFilterComparisonType) {

    if (columnValue === undefined || columnValue === null) {
        return false;
    }

    if (filterValue === undefined || filterValue === null) {
        return false;
    }

    if (selectedFilterComparisonType === '>') {
        return columnValue > filterValue;
    }
    else if (selectedFilterComparisonType === '>=') {
        return columnValue >= filterValue;
    }
    else if (selectedFilterComparisonType === '<') {
        return columnValue < filterValue;
    }
    else if (selectedFilterComparisonType === '<=') {
        return columnValue <= filterValue;
    }
    else if (selectedFilterComparisonType === '===') {
        return columnValue === filterValue;
    }
    else if (selectedFilterComparisonType === '!==') {
        return columnValue !== filterValue;
    }

    return true;
}

function filterText(columnValue, filterValue, selectedFilterComparisonType) {

    if (columnValue === undefined || columnValue === null) {
        return false;
    }

    if (filterValue === undefined || filterValue === null) {
        return false;
    }

    if (selectedFilterComparisonType === '===') {
        if (filterValue === '***#undefined#***') {
            return columnValue === filterValue || columnValue === null || columnValue === '';
        } else {
            return columnValue.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0
        }
    }
    else if (selectedFilterComparisonType === '!==') {
        if (filterValue === '***#undefined#***') {
            return columnValue !== filterValue && columnValue !== null && columnValue !== '';
        } else {
            return columnValue.toLowerCase().indexOf(filterValue) === -1;
        }     
    }

    return true;
}