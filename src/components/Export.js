const Export = {
    exportExcel
}

async function exportExcel(tableData, tableName, headers) {
    import('xlsx').then(xlsx => {
        if (!tableData)
            return;
        const worksheet = xlsx.utils.json_to_sheet(tableData);
        if (headers && Array.isArray(headers) && headers.length > 0)
            xlsx.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAsExcelFile(excelBuffer, tableName);
    });
}

async function saveAsExcelFile(buffer, fileName) {
    import('file-saver').then(FileSaver => {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.default.saveAs(data, fileName + '_' + new Date().toUTCString() + EXCEL_EXTENSION);
    });
}


export default Export;