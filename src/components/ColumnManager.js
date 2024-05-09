import React from "react";
import PropTypes from 'prop-types';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { dataTableSettingServices } from '../services/DataTableSettingServices';
import '../assets/scss/ColumnManager.scss';
const ColumnManager = ({ columns, dataTableName, onSave, buttonClassNames, setSortState }, ref) => {
    const [showDialog, setShowDialog] = React.useState(false);
    const [tableState, setTableState] = React.useState({});
    const [nextOrder, setNextOrder] = React.useState(null);
    const [columnsSelection, setColumnsSelection] = React.useState(columns?.map(c => ({
        key: c.field ?? c.columnKey,
        header: typeof c.header === 'string' ? c.header : null,
        isVisible: true
    })));

    const sortTypes = [
        { label: 'Asc', value: 1 },
        { label: 'Desc', value: -1 }
    ];

    React.useEffect(() => {
        if (showDialog) {
            var state = window.localStorage.getItem(dataTableName);
            if (state) {
                var dataTableState = JSON.parse(state);
                if (dataTableState) {
                    if (dataTableState.first !== undefined) {
                        dataTableSettingServices.set(dataTableName, { columns: columnsSelection });
                    }
                    if (dataTableState.columns) {
                        let tempColumns = [...dataTableState.columns];
                        const toBeRemoved = tempColumns.filter(c =>
                            columns.findIndex(col => c.key === (col.field ?? col.columnKey)) === -1);
                        if (toBeRemoved) {
                            tempColumns = tempColumns.filter(tc => toBeRemoved.findIndex(t => t.key === tc.key) === -1);
                        }
                        const toBeAdded = columns.filter(c =>
                            tempColumns.findIndex(col => col.key === (c.field ?? c.columnKey)) === -1);
                        if (toBeAdded) {
                            tempColumns.push(...toBeAdded.map(c => ({
                                key: c.field ?? c.columnKey,
                                header: typeof c.header === 'string' ? c.header : null,
                                isVisible: true
                            })));
                        }
                        dataTableState.columns = tempColumns;
                        setColumnsSelection(tempColumns);
                        setTableState(dataTableState);
                    }
                    if (dataTableState.sorting) {
                        let tempColumns = [...dataTableState.columns];
                        dataTableState.sorting.forEach((state, index) => {
                            var toBeUpdate = tempColumns.find(x => x.key === state.field);
                            if (toBeUpdate) {
                                toBeUpdate.order = index + 1;
                                toBeUpdate.sortType = state.order ?? 1;
                            }
                        })

                        var orders = dataTableState.sorting.map((x, index) => index + 1);
                        orders = orders.filter(x => x);
                        var max = orders.reduce((a, b) => {
                            return Math.max(a, b);
                        }, 1);
                        var i = 1;
                        while (i <= max + 1) {
                            if (!orders.includes(i)) {
                                setNextOrder(i);
                                break;
                            }
                            i++;
                        }

                        setColumnsSelection(tempColumns);
                    }
                }
            }
        }
    }, [showDialog]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        var state = window.localStorage.getItem(dataTableName);
        if (state) {
            var dataTableState = JSON.parse(state);
            if (setSortState) {
                setSortState(dataTableState.sorting);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        setTableState(prevState => ({
            ...prevState, columns: columnsSelection.map((item) => ({ ...item, order: null, sortType: null })),
            sorting: columnsSelection.filter(x => x.order)
                .sort((a, b) => a.order - b.order)
                .map(x => ({ field: x.key, order: parseInt(x.sortType ?? 1) }))
        }));
    }, [columnsSelection]);

    const onSaveClicked = () => {
        dataTableSettingServices.set(dataTableName, tableState);

        if (setSortState) {
            var sortData = columnsSelection.filter(x => x.order)
                .sort((a, b) => a.order - b.order)
                .map(x => ({ field: x.key, order: parseInt(x.sortType ?? 1) }));
            setSortState(sortData);
        }
        if (onSave)
            onSave();
        onHideDialog();
    }
    const onHideDialog = () => {
        setShowDialog(false);
    }
    const renderFooter = () => {
        return (
            <div className="flex flex-wrap w-100">
                <Button label="Save" className="p-button-raised p-button-success m-2 ml-auto" onClick={onSaveClicked} />
            </div>
        );
    }
    const onTogggleVisibility = (item, e) => {
        let tempColumn = [...columnsSelection];
        let toBeUpdated = tempColumn.find(c => c.key === item.key);
        toBeUpdated && (toBeUpdated.isVisible = e.value);
        setColumnsSelection(tempColumn);
    }
    const onOrderChange = (item, e) => {
        let tempColumn = [...columnsSelection];
        if (e.target.value && e.target.value !== nextOrder) {
            e.target.value = nextOrder;
        }

        var orderInputs = document.getElementsByClassName("order-number");
        var inputsArray = [...orderInputs];
        if (inputsArray) {
            var orders = inputsArray.map(x => parseInt(x.value));
            orders = orders.filter(x => x);
        }

        var max = orders.reduce((a, b) => {
            return Math.max(a, b);
        }, 1);
        var i = 1;
        while (i <= max + 1) {
            if (!orders.includes(i)) {
                setNextOrder(i);
                break;
            }
            i++;
        }

        let toBeUpdated = tempColumn.find(c => c.key === item.key);
        toBeUpdated && (toBeUpdated.order = e.target.value);
        setColumnsSelection(tempColumn);
    }

    const onOrderTypeChange = (item, e) => {
        let tempColumn = [...columnsSelection];
        let toBeUpdated = tempColumn.find(c => c.key === item.key);
        toBeUpdated && (toBeUpdated.sortType = parseInt(e.target.value));
        setColumnsSelection(tempColumn);
    }

    if (ref)
        ref.current = {
        };
    return (
        <React.Fragment>
            <Dialog id="column-manager" header="Columns Manager" footer={renderFooter}
                visible={showDialog} maximizable modal style={{ width: '50vw' }} onHide={onHideDialog}>
                <DragDropContext onDragEnd={(param) => {
                    const srcI = param.source.index;
                    const desI = param.destination?.index;
                    if (desI) {
                        columnsSelection.splice(desI, 0, columnsSelection.splice(srcI, 1)[0]);
                        setColumnsSelection([...columnsSelection]);
                    }
                }}>
                    <Droppable droppableId="column-manager-droppable">
                        {(provided, snapshot) => (
                            <div className="list-container" ref={provided.innerRef} {...provided.droppableProps}
                                style={{
                                    ...provided.droppableProps.style,
                                    backgroundColor: snapshot.isUsingPlaceholder
                                        ? "#DCDCDC"
                                        : "#FFF",
                                }}>
                                {columnsSelection.map((item, i) => (

                                    <Draggable key={item.key} draggableId={"draggable-" + item.key} index={i} >
                                        {(provided, snapshot) => (
                                            <div className={classNames('list-item',
                                                {
                                                    'is-visible': item.isVisible,
                                                    'is-hidden': !item.isVisible,
                                                    'is-dragging': snapshot.isDragging
                                                })}
                                                ref={provided.innerRef} {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    boxShadow: snapshot.isDragging
                                                        ? "0 0 .4rem #666"
                                                        : "none"
                                                }}>
                                                <span className="drag-handle pi pi-align-justify" {...provided.dragHandleProps} />
                                                <span className="item-title">{item.header ?? item.key}</span>
                                                <div className="action-box flex justify-content-around align-items-center mv-1">
                                                    <InputNumber className="mr-2  order-number" value={item.order} onValueChange={(e) => onOrderChange(item, e)}
                                                        mode="decimal" showButtons placeholder="Order" />
                                                    <Dropdown className="mr-2" value={item.sortType ?? 1} options={sortTypes}
                                                        onChange={e => onOrderTypeChange(item, e)} placeholder="Sort Type" />
                                                    <InputSwitch checked={item.isVisible} onChange={e => onTogggleVisibility(item, e)} />
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Dialog>
            <Button type="button" icon="pi pi-cog" className={classNames("p-button-help ml-1", buttonClassNames)}
                onClick={() => setShowDialog(true)} />
        </React.Fragment >
    );
};


ColumnManager.prototype = {
    columns: PropTypes.array,
    dataTableName: PropTypes.string,
    onSave: PropTypes.func,
    setSortState: PropTypes.func,
    buttonClassNames: PropTypes.string,
    ref: PropTypes.object,
}

export default React.forwardRef(ColumnManager);