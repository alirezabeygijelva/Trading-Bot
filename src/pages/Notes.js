import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { dateHelper } from '../utils/DateHelper';
import { contentHelper } from '../utils/ContentHelper';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { scalpServices } from '../services/ScalpServices';
import { columnHelper } from '../utils/ColumnHelper';
import { filterHelper } from '../utils/FilterHelper';
import { FilterType } from '../utils/FilterType';
import Export from '../components/Export';
import Paginator from '../components/Paginator';
import ColumnManager from '../components/ColumnManager';
import FilterManager from '../components/FilterManager';
import '../assets/scss/Notes.scss';

const Notes = () => {
    const state = window.localStorage.getItem("server-filters-global-notes");
    var filtersDefValue =state ? JSON.parse(state) : {};
    const pg = useRef(null);
    const dt = useRef(null);
    const cm = useRef(null);
    const toast = useRef(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [selectedDate, setSelectedDate] = useState([]);
    const [selctedUserName, setSelctedUserName] = useState('');
    const [selectedServerUserName, setSelectedServerUserName] = useState(filtersDefValue.userName ?? '');
    const [selectedServerStartDate, setSelectedServerStartDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'month').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedContent, setSelectedContent] = useState(null);
    const [showTextDialog, setShowTextDialog] = useState(false);
    const [textDialogValue, setTextDialogValue] = useState('');
    const [displayDeleteDialog, setDisplayDeleteDialog] = useState('');
    const [deleteNoteId, setDeleteNoteId] = useState('');
    const [datatableFilters, setDatatableFilters] = useState({});
    const [filteredColumns, setFilteredColumns] = useState([]);
    const [multiSortMeta, setMultiSortMeta] = useState([]);

    const menuModel = [
        {
            label: 'Copy Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent.originalEvent?.target?.innerText)
        },
        {
            label: 'Copy Data',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent.value[selectedContent.originalEvent.target.classList[0]])
        },
    ];

    useEffect(() => {
        loadData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setLoading(true);
        var start = null;
        var end = null;
        if (selectedServerStartDate) {
            const time = selectedServerStartTime.split(":");
            selectedServerStartDate.setHours(time[0])
            selectedServerStartDate.setMinutes(time[1])
            selectedServerStartDate.setSeconds(time[2])
            start = dateHelper.considerAsUTCUnix(selectedServerStartDate)
        }
        if (selectedServerEndDate) {
            const time = selectedServerEndTime.split(":");
            selectedServerEndDate.setHours(time[0])
            selectedServerEndDate.setMinutes(time[1])
            selectedServerEndDate.setSeconds(time[2])
            end = dateHelper.considerAsUTCUnix(selectedServerEndDate)
        }
        scalpServices.getNotes(selectedServerUserName, start, end).then(data => {
            setNotes(data ?? []);
            setLoading(false);
        });
    }

    const onDateChange = (e) => {
        dt.current.filter(e.value, 'creationDate', 'custom');
        setSelectedDate(e.value);
    }

    const onUserNameChange = (e) => {
        dt.current.filter(e.target.value, 'userFullName', 'custom');
        setSelctedUserName(e.target.value);
    }

    const reset = () => {
        setSelectedDate(null);
        setSelctedUserName(null);
        setGlobalFilter('');
        setFilteredColumns([]);
        setDatatableFilters([]);
        dt.current.reset();
    }

    const onCustomFilter= (ev)=>{
        setFilteredColumns(Object.keys(ev.filters));
        setDatatableFilters(ev.filters);
    }

    const dateFilter = <Calendar value={selectedDate} selectionMode="range" showIcon showButtonBar onChange={onDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const userNameFilter = <InputText value={selctedUserName} onChange={onUserNameChange} />

    const onHide = () => {
        setShowTextDialog(false);
    }

    const textTemplateBody = (rowData) => {
        if (rowData.text && rowData.text.length > 50) {
            return <span style={{ cursor: 'pointer' }} onClick={() => showDialog(rowData)} >{rowData.text.substr(0, 50)}<b> ...</b></span>
        }
        return rowData.text;
    }

    const showDialog = (rowData) => {
        setTextDialogValue(rowData.text);
        setShowTextDialog(true);
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <Button icon="pi pi-trash" title="Delete" className="p-button-rounded p-button-outlined p-button-danger" onClick={() => deleteNote(rowData.id)} />
        );
    }

    const deleteNote = (id) => {
        setDeleteNoteId(id);
        setDisplayDeleteDialog(true);
    }

    const acceptDeleteEngine = () => {
        setLoading(true);
        scalpServices.deleteNote(deleteNoteId).then((response) => {
            if (Array.isArray(response)) {
                toast.current.show(response.map(x => ({
                    severity: 'error',
                    detail: `${x}`,
                    life: 5000
                })));
                setLoading(false);
            } else {
                toast.current.show({
                    severity: 'success',
                    detail: "Opration Successfully",
                    life: 4000
                });
                loadData();
            }
        });
    }

    const columns = [
        {
            ...columnHelper.defaultColumn,
            field: "creationDate",
            header: "Date",
            sortable: true,
            filter: true,
            filterElement: dateFilter,
            style: { 'minWidth': '50px', width: '50px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "userFullName",
            header: "User",
            sortable: true,
            filter: true,
            filterElement: userNameFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, '==='),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "text",
            header: "Note",
            style: { 'minWidth': '50px', width: '120px' },
            body: textTemplateBody
        },
        {
            ...columnHelper.defaultColumn,
            columnKey: "actions",
            header: "Actions",
            body: actionBodyTemplate,
            style: { 'minWidth': '25px', width: '25px' },
            bodyStyle: { justifyContent: 'center', overflow: 'visible' }
        }
    ]

    const serverCustomableFilters=[
        {
            name: "userName",
            label: "User name",
            type: FilterType.Text,
            state: selectedServerUserName,
            setState: setSelectedServerUserName
        }, 
        {
            name: "startDate",
            label: "From Date",
            type: FilterType.Date,
            state: selectedServerStartDate,
            setState: setSelectedServerStartDate
        }, 
        {
            name: "startTime",
            label: "From Time",
            type: FilterType.Time,
            state: selectedServerStartTime,
            setState: setSelectedServerStartTime
        },  
        {
            name: "endDate",
            label: "To Date",
            type: FilterType.Date,
            state: selectedServerEndDate,
            setState: setSelectedServerEndDate
        }, 
        {
            name: "endTime",
            label: "To Time",
            type: FilterType.Time,
            state: selectedServerEndTime,
            setState: setSelectedServerEndTime
        }   
    ]

    const header = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(notes, "notes")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-global-notes" setSortState={setMultiSortMeta}
                onSave={() => setNotes(prevState => [...prevState])} />
        </div>
    );
    
    return (
        <div id="notes-container">
            <Toast ref={toast} />
            <Card style={{ width: '100%', marginBottom: '2em' }}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="userName" className="align-self-baseline">User name</label>
                        <InputText id='userName' value={selectedServerUserName}
                            onChange={(e) => setSelectedServerUserName(e.target.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-9 hidden lg:block"></div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStartDate">From Date</label>
                        <Calendar id="serverStartDate" value={selectedServerStartDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                            onChange={(e) => setSelectedServerStartDate(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStartTime" className="align-self-baseline">From Time</label>
                        <InputMask mask="99:99:99" value={selectedServerStartTime}
                            onChange={(e) => setSelectedServerStartTime(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverEndDate" className="align-self-baseline">To Date</label>
                        <Calendar id="serverEndDate" value={selectedServerEndDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                            onChange={(e) => setSelectedServerEndDate(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverEndTime" className="align-self-baseline">To Time</label>
                        <InputMask mask="99:99:99" value={selectedServerEndTime}
                            onChange={(e) => setSelectedServerEndTime(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto"
                            icon="pi pi-search" onClick={loadData} style={{ 'width': 'unset' }} loading={loading} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-global-notes"
                            onSave={loadData}/>
                    </div>
                </div>
            </Card>
            <ConfirmDialog visible={displayDeleteDialog} onHide={() => setDisplayDeleteDialog(false)} message="Are you sure you want to Delete it?"
                header="Confirmation" icon="pi pi-exclamation-triangle" accept={acceptDeleteEngine} reject={() => setDisplayDeleteDialog(false)} />
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={notes} className={"p-datatable-sm"} scrollable showGridlines filterDisplay="row" scrollDirection="both"
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" filters={datatableFilters} onFilter={onCustomFilter}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-global-notes", filteredColumns)}

                </DataTable>
            </div>
            <Dialog header="Message" maximizable visible={showTextDialog} style={{ width: '50vw' }} onHide={onHide} dismissableMask={true}>
                <div className="p-d-flex p-jc-center">
                    <div className="card">
                        <InputTextarea name="text" value={textDialogValue} rows={5} cols={60} autoResize 
                        style={{ width: '100%', direction : (contentHelper.isRTL(textDialogValue) ? "rtl" : "ltr") }} />
                        <Button type="button" label="Close" className="p-button-secondary" onClick={onHide} style={{ width: '100%' }} />
                    </div>
                </div>
            </Dialog>
        </div>)
}

export default Notes;