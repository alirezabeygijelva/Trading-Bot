import { Tooltip } from 'primereact/tooltip';
import React from 'react';
import { dateHelper } from './DateHelper';

export const templates = {
    dateBodyTemplate,
    digitBodyTemplate,
    booleanBodyTemplate,
    booleanWarningBodyTemplate,
    tooltipBodyTemplate,
    symboleBodyTemplate,
    digitDollarBodyTemplate,
    commaBodyTemplate
}

function commaBodyTemplate(rowData, row) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }

        if (value)
            return value.replace(',', ',\u200B');
    }
    return '';
}

function dateBodyTemplate(rowData, row) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value && Number.isInteger(value) && value > 0) {
            return dateHelper.formatDate(value);
        }
    }
    return '';
}

function digitBodyTemplate(rowData, row, precision) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value && !Number.isNaN(value)) {
            return value.toLocaleString(undefined, { maximumFractionDigits: (precision === 0 ? 0 : precision || 4) });
        } else {
            return 0;
        }
    }
    return '';
}

function digitDollarBodyTemplate(rowData, row, precision) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value && !Number.isNaN(value)) {
            return "$" + value.toLocaleString(undefined, { maximumFractionDigits: (precision === 0 ? 0 : precision || 4) });
        } else {
            return "$0";
        }
    }
    return '';
}

function booleanBodyTemplate(rowData, row) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value == null)
            return '';
        if (Boolean(value))
            return <i className="pi pi-check" style={{ color: 'green' }}></i>
        return <i className="pi pi-times" style={{ color: 'red' }}></i>
    }
    return '';
}

function booleanWarningBodyTemplate(rowData, row) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value == null)
            return '';
        if (Boolean(value))
            return <i className="pi pi-exclamation-triangle" style={{ color: 'orange' ,'fontSize': '2em'}}></i>
        return ''
    }
    return '';
}
function tooltipBodyTemplate(tooltipKey, rowData, row) {
    if (rowData) {
        let value = rowData[row.field];
        if (row.field?.includes('.')) {
            var fieldArray = row.field.split('.');
            if (fieldArray.length === 2) {
                let parent = rowData[fieldArray[0]];
                if (parent)
                    value = parent[fieldArray[1]];
            }
        }
        if (value == null)
            return '';

        return (<React.Fragment>
            <Tooltip target={`#${tooltipKey}_itemTooltip`} style={{ wordBreak: 'break-all', maxWidth: 'unset' }} />
            <span id={`${tooltipKey}_itemTooltip`} data-pr-tooltip={value}
                style={{ textOverflow: 'ellipsis', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</span>
        </React.Fragment>)
    }
    return '';
}

function symboleBodyTemplate(rowData, watchList, isLink = false) {
    if (rowData) {
        if (watchList.includes(rowData.symbol)) {
            return (isLink ?
                <a href={`${window.location.origin}/chart?id=${rowData.id}`}><b>{rowData.symbol}</b></a>
                : <b>{rowData.symbol}</b>)
        }
        else {
            return (isLink ?
                <a href={`${window.location.origin}/chart?id=${rowData.id}`}>{rowData.symbol}</a>
                : rowData.symbol)
        }
    }
    return '';
}





