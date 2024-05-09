import { Column } from 'primereact/column';

const defaultColumn = {
    columnKey: null,
    field: null,
    sortField: null,
    filterField: null,
    header: null,
    body: null,
    footer: null,
    sortable: false,
    sortFunction: null,
    sortableDisabled: false,
    filter: false,
    filterMatchMode: null,
    filterType: 'text',
    filterPlaceholder: null,
    filterMaxlength: null,
    filterElement: null,
    filterFunction: null,
    excludeGlobalFilter: false,
    filterHeaderStyle: null,
    filterHeaderClassName: null,
    style: null,
    className: null,
    headerClassName: null,
    bodyStyle: null,
    bodyClassName: null,
    footerStyle: null,
    footerClassName: null,
    expander: false,
    frozen: false,
    selectionMode: null,
    colSpan: null,
    rowSpan: null,
    editor: null,
    editorValidator: null,
    editorValidatorEvent: 'click',
    onBeforeEditorShow: null,
    onBeforeEditorHide: null,
    onEditorInit: null,
    onEditorSubmit: null,
    onEditorCancel: null,
    rowReorder: false,
    rowReorderIcon: 'pi pi-bars',
    rowEditor: false,
    exportable: true,
    reorderable: null,
    align: null,
    alignFrozen: 'left',
    alignHeader: null,
    dataType: null,
    exportField: null,
    filterApply: null,
    filterClear: null,
    filterFooter: null,
    filterHeader: null,
    filterMatchModeOptions: null,
    filterMenuClassName: null,
    filterMenuStyle: null,
    hidden: false,
    maxConstraints: 2,
    onFilterApplyClick: null,
    onFilterClear: null,
    onFilterConstraintAdd: null,
    onFilterConstraintRemove: null,
    onFilterMatchModeChange: null,
    onFilterOperatorChange: null,
    resizeable: null,
    showAddButton: true,
    showApplyButton: true,
    showClearButton: true,
    showFilterMatchModes: false, //Default is true
    showFilterMenu: false, //Default is true
    showFilterMenuOptions: false, //Default is true
    showFilterOperator: false, //Default is true,
    ignoreOnGeneration: false
}

export const columnHelper = {
    generatColumns,
    defaultColumn
}


function generatColumns(columns, dataTableName, filteredColumn) {
    var columnsToShow = columns.filter(col => !col.ignoreOnGeneration);
    var state = window.localStorage.getItem(dataTableName);
    if (state) {
        var dataTableState = JSON.parse(state);
        if (dataTableState && dataTableState.columns) {
            columnsToShow.sort((a, b) => {
                const keys = dataTableState.columns.map(c => c.key);
                const aIndex = keys.indexOf(a.field ?? a.columnKey);
                const bIndex = keys.indexOf(b.field ?? b.columnKey);
                if (aIndex < 0 || bIndex < 0)
                    return 1;
                return aIndex - bIndex;
            });
            columnsToShow = columnsToShow.filter(c => {
                const col = dataTableState.columns.find(column => column.key === (c.field ?? c.columnKey))
                if (col && col.isVisible === false)
                    return false;
                return true;
            });
        }
    }
    var result = columnsToShow?.map((col, i) => {
        if (filteredColumn && filteredColumn.includes(col.field)) {
            (col.headerStyle && (col.headerStyle.color = "#2196F3"))
                || (!col.headerStyle && (col.headerStyle = { color: "#2196F3" }));
        } else {
            col.headerStyle && col.headerStyle.color && (col.headerStyle.color = "");
        }

        if (col.className)
            col.className = `${col.field} ${col.className}`;
        else
            col.className = col.field;

        return <Column key={col.field}
            columnKey={col.columnKey}
            field={col.field}
            sortField={col.sortField}
            filterField={col.filterField}
            header={col.header}
            body={col.body}
            footer={col.footer}
            sortable={col.sortable}
            sortFunction={col.sortFunction}
            sortableDisabled={col.sortableDisabled}
            filter={col.filter}
            filterMatchMode={col.filterMatchMode}
            filterType={col.filterType}
            filterPlaceholder={col.filterPlaceholder}
            filterMaxlength={col.filterMaxlength}
            filterElement={col.filterElement}
            filterFunction={col.filterFunction}
            excludeGlobalFilter={col.excludeGlobalFilter}
            filterHeaderStyle={col.filterHeaderStyle}
            filterHeaderClassName={col.filterHeaderClassName}
            style={col.style}
            className={col.className}
            headerStyle={col.headerStyle}
            headerClassName={col.headerClassName}
            bodyStyle={col.bodyStyle}
            bodyClassName={col.bodyClassName}
            footerStyle={col.footerStyle}
            footerClassName={col.footerClassName}
            expander={col.expander}
            frozen={col.frozen}
            selectionMode={col.selectionMode}
            colSpan={col.colSpan}
            rowSpan={col.rowSpan}
            editor={col.editor}
            editorValidator={col.editorValidator}
            editorValidatorEvent={col.editorValidatorEvent}
            onBeforeEditorShow={col.onBeforeEditorShow}
            onBeforeEditorHide={col.onBeforeEditorHide}
            onEditorInit={col.onEditorInit}
            onEditorSubmit={col.onEditorSubmit}
            onEditorCancel={col.onEditorCancel}
            rowReorder={col.rowReorder}
            rowReorderIcon={col.rowReorderIcon}
            rowEditor={col.rowEditor}
            exportable={col.exportable}
            reorderable={col.reorderable}
            align={col.align}
            alignFrozen={col.alignFrozen}
            alignHeader={col.alignHeader}
            dataType={col.dataType}
            exportField={col.exportField}
            filterApply={col.filterApply}
            filterClear={col.filterClear}
            filterFooter={col.filterFooter}
            filterHeader={col.filterHeader}
            filterMatchModeOptions={col.filterMatchModeOptions}
            filterMenuClassName={col.filterMenuClassName}
            filterMenuStyle={col.filterMenuStyle}
            hidden={col.hidden}
            maxConstraints={col.maxConstraints}
            onFilterApplyClick={col.onFilterApplyClick}
            onFilterClear={col.onFilterClear}
            onFilterConstraintAdd={col.onFilterConstraintAdd}
            onFilterConstraintRemove={col.onFilterConstraintRemove}
            onFilterMatchModeChange={col.onFilterMatchModeChange}
            onFilterOperatorChange={col.onFilterOperatorChange}
            resizeable={col.resizeable}
            showAddButton={col.showAddButton}
            showApplyButton={col.showApplyButton}
            showClearButton={col.showClearButton}
            showFilterMatchModes={col.showFilterMatchModes}
            showFilterMenu={col.showFilterMenu}
            showFilterMenuOptions={col.showFilterMenuOptions}
            showFilterOperator={col.showFilterOperator}
        />
    });
    return result;
};