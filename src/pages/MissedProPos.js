import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { dateHelper } from '../utils/DateHelper';
import { contentHelper } from '../utils/ContentHelper';
import { filterHelper } from '../utils/FilterHelper';
import { templates } from '../utils/Templates';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { columnHelper } from '../utils/ColumnHelper';
import { scalpServices } from '../services/ScalpServices';
import Export from '../components/Export';
import ColumnManager from '../components/ColumnManager';
import Paginator from '../components/Paginator';
import { exchangeServices } from '../services/ExchangeServices';
import { FilterType } from '../utils/FilterType';
import FilterManager from '../components/FilterManager';
import '../assets/scss/MissedPrePos.scss';
import { IntervalHelper } from '../utils/IntervalHelper';

const MissedPrePos = () => {
    const state = window.localStorage.getItem("server-filters-missedprepos");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const pg = useRef(null);
    const dt = useRef(null);
    const cm = useRef(null);
    const toast = useRef(null);
    const [missedPrePos, setMissedPrePos] = useState([]);
    const [selectedDivergences, setSelectedDivergences] = useState(null);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [selectedInterval, setSelectedInterval] = useState([]);
    const [selectedDivergenceStartDate, setSelectedDivergenceStartDate] = useState([]);
    const [selectedDivergenceEndDate, setSelectedDivergenceEndDate] = useState([]);
    const [selectedMacdStartDate, setSelectedMacdStartDate] = useState([]);
    const [selectedMacdEndDate, setSelectedMacdEndDate] = useState([]);
    const [selectedRefCandleDate, setSelectedRefCandleDate] = useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = useState(filtersDefValue.timeFrame);
    const [selectedServerStartDate, setSelectedServerStartDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'months').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [symbols, setSymbols] = useState([]);
    const [exchangeSymbols, setExchangeSymbols] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedContent, setSelectedContent] = useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = useState(null);
    const [selectedTextFilterType, setSelectedTextFilterType] = useState(null);
    const [selectedTextFilterValue, setSelectedTextFilterValue] = useState('');
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = useState(false);
    const [displayTextFilterDialog, setDisplayTextFilterDialog] = useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = useState(null);
    const [displayTextColumnFilter, setDisplayTextColumnFilter] = useState(null);
    const [displayDeleteDialog, setDisplayDeleteDialog] = useState('');
    const [deleteMissedPrePosId, setDeleteMissedPrePosId] = useState('');
    const [filteredColumns, setFilteredColumns] = useState([]);
    const [datatableFilters, setDatatableFilters] = useState({});
    const [multiSortMeta, setMultiSortMeta] = useState([]);
    const [numericColumnComparisonType, setNumericColumnComparisonType] = useState({
        order: '',
        rewardToRisk: '',
        trigger: '',
        stopLoss: '',
        target: '',
        positionDurationInMinutes: '',
        quantityToTrade: '',
        depositNeeded: '',
        balanceBeforeDeposit: '',
        withdraw: '',
        balanceAfterExit: '',
        id: '',
        prerequisiteId: ''
    });
    const [textColumnComparisonType, setTextColumnComparisonType] = useState({
        type: ''
    });

    const textFilterType = [
        { label: 'equal', value: '===' },
        { label: 'Not equal', value: '!==' }
    ];

    const numericFilterType = [
        { label: 'Greater than', value: '>' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than', value: '<' },
        { label: 'Less than or equal to', value: '<=' },
        { label: 'equal', value: '===' },
        { label: 'Not equal', value: '!==' }
    ];

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
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
        });
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });
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
            start = dateHelper.considerAsUTCUnix(selectedServerStartDate);
        }
        if (selectedServerEndDate) {
            const time = selectedServerEndTime.split(":");
            selectedServerEndDate.setHours(time[0])
            selectedServerEndDate.setMinutes(time[1])
            selectedServerEndDate.setSeconds(time[2])
            end = dateHelper.considerAsUTCUnix(selectedServerEndDate);
        }
        scalpServices.getMissedPrePos(selectedServerSymbols, selectedServerInterval, start, end).then(data => {
            setMissedPrePos(data);
            setLoading(false);
        });
    }
    const intervals = IntervalHelper.intervalsList();

    const onSymbolChange = (e) => {
        dt.current.filter(e.value, 'symbol', 'in');
        setSelectedSymbols(e.value);
    }

    const onIntervalChange = (e) => {
        dt.current.filter(e.value, 'timeFrameStr', 'equals');
        setSelectedInterval(e.value);
    }


    const onDivergenceStartDateChange = (e) => {
        dt.current.filter(e.value, 'divergenceStartDate', 'custom');
        setSelectedDivergenceStartDate(e.value);
    }

    const onDivergenceEndDateChange = (e) => {
        dt.current.filter(e.value, 'divergenceEndDate', 'custom');
        setSelectedDivergenceEndDate(e.value);
    }

    const onMacdStartDateChange = (e) => {
        dt.current.filter(e.value, 'macdStartDate', 'custom');
        setSelectedMacdStartDate(e.value);
    }

    const onMacdEndDateChange = (e) => {
        dt.current.filter(e.value, 'macdEndDate', 'custom');
        setSelectedMacdEndDate(e.value);
    }

    const onRefCandleDateChange = (e) => {
        dt.current.filter(e.value, 'refCandleDate', 'custom');
        setSelectedRefCandleDate(e.value);
    }

    /*********** Start Numeric Filter ***********/
    const onNumericFilter = (type) => {
        var temp = { ...numericColumnComparisonType };
        temp[displayNumericColumnFilter] = selectedNumericFilterType;
        setNumericColumnComparisonType(temp);
        dt.current.filter(selectedNumericFilterValue, displayNumericColumnFilter, 'custom');
        setSelectedNumericFilterValue(null);
        setSelectedNumericFilterType(null);
        onNumericFilterHide(type);
    }

    const onNumericFilterClear = (name) => {
        var temp = { ...numericColumnComparisonType };
        temp[name] = '';
        setNumericColumnComparisonType(temp);
        dt.current.filter(null, name, 'custom');
    }

    const onNumericFilterOpen = (name, type) => {
        setDisplayNumericColumnFilter(name);
        if (type === 'decimal') {
            setDisplayNumericFilterDialogForDecimal(true);
        }
        else if (type === 'integer') {
            setDisplayNumericFilterDialogForInteger(true);
        }
    }

    const onNumericFilterHide = (type) => {
        if (type === 'decimal') {
            setDisplayNumericFilterDialogForDecimal(false);
        }
        else if (type === 'integer') {
            setDisplayNumericFilterDialogForInteger(false);
        }
    }

    const renderFooter = (type) => {
        return (
            <div style={{ float: 'left' }}>
                <Button label="Filter" icon="pi pi-check" onClick={() => onNumericFilter(type)} autoFocus />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onNumericFilterHide(type)} className="p-button-text" />
            </div>
        )
    };
    /*********** End Numeric Filter ***********/
    /*********** Start Text Filter ***********/
    const onTextFilter = () => {
        var temp = { ...textColumnComparisonType };
        temp[displayTextColumnFilter] = selectedTextFilterType;
        setTextColumnComparisonType(temp);

        if (selectedTextFilterValue === null || selectedTextFilterValue === undefined || selectedTextFilterValue === '')
            dt.current.filter('***#undefined#***', displayTextColumnFilter, 'custom');
        else
            dt.current.filter(selectedTextFilterValue, displayTextColumnFilter, 'custom');
        setSelectedTextFilterValue('');
        setSelectedTextFilterType(null);
        onTextFilterHide();
    }

    const onTextFilterClear = (name) => {
        var temp = { ...textColumnComparisonType };
        temp[name] = '';
        setTextColumnComparisonType(temp);
        dt.current.filter(null, name, 'custom');
    }

    const onTextFilterOpen = (name) => {
        setDisplayTextColumnFilter(name);
        setDisplayTextFilterDialog(true);
    }

    const onTextFilterHide = () => {
        setDisplayTextFilterDialog(false);
    }

    const textRenderFooter = () => {
        return (
            <div style={{ float: 'left' }}>
                <Button label="Filter" icon="pi pi-check" onClick={() => onTextFilter()} autoFocus />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onTextFilterHide()} className="p-button-text" />
            </div>
        )
    };
    /*********** End String Filter ***********/
    const reset = () => {
        setSelectedSymbols(null);
        setSelectedInterval(null);
        setSelectedDivergenceStartDate(null);
        setSelectedDivergenceEndDate(null);
        setSelectedMacdStartDate(null);
        setSelectedMacdEndDate(null);
        setSelectedRefCandleDate(null);
        setNumericColumnComparisonType({
            order: '',
            rewardToRisk: '',
            trigger: '',
            stopLoss: '',
            target: '',
            positionDurationInMinutes: '',
            quantityToTrade: '',
            depositNeeded: '',
            balanceBeforeDeposit: '',
            withdraw: '',
            balanceAfterExit: '',
            id: '',
            prerequisiteId: ''
        });
        setTextColumnComparisonType({
            type: ''
        });
        setGlobalFilter('');
        setFilteredColumns([]);
        setDatatableFilters([]);
        dt.current.reset();
    }

    const onCustomFilter = (ev) => {
        setFilteredColumns(Object.keys(ev.filters));
        setDatatableFilters(ev.filters);
    }

    const symbolFilter = <MultiSelect value={selectedSymbols} options={symbols} onChange={onSymbolChange} placeholder="Select a Symbol" className="p-column-filter" filter showClear />;
    const timeFrameFilter = <Dropdown value={selectedInterval} options={intervals} onChange={onIntervalChange} placeholder="Select a Time Frame" className="p-column-filter" filter showClear />;
    const divergenceStartDateFilter = <Calendar value={selectedDivergenceStartDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceStartDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const divergenceEndDateFilter = <Calendar value={selectedDivergenceEndDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceEndDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const macdStartDateFilter = <Calendar value={selectedMacdStartDate} selectionMode="range" showIcon showButtonBar onChange={onMacdStartDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const macdEndDateFilter = <Calendar value={selectedMacdEndDate} selectionMode="range" showIcon showButtonBar onChange={onMacdEndDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const refCandleDateFilter = <Calendar value={selectedRefCandleDate} selectionMode="range" showIcon showButtonBar onChange={onRefCandleDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const idFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('id', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('id')} />
        </span>
    const divergenceTypeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('type')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('type')} />
        </span>
    const prerequisiteIdFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('prerequisiteId', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('prerequisiteId')} />
        </span>

    const actionBodyTemplate = (rowData) => {
        return (
            <Button icon="pi pi-trash" tooltip="Delete" className="p-button-rounded p-button-outlined p-button-danger" onClick={() => deleteMissedPrePos(rowData.id)} />
        );
    }

    const deleteMissedPrePos = (id) => {
        setDeleteMissedPrePosId(id);
        setDisplayDeleteDialog(true);
    }

    const acceptDeleteEngine = () => {
        setLoading(true);
        scalpServices.deleteMissedPrePos(deleteMissedPrePosId).then((response) => {
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
            field: "id",
            header: "Id",
            sortable: true,
            filter: true,
            filterElement: idFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.id),
            style: { 'minWidth': '50px', width: '80px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "symbol",
            header: "Symbol",
            sortable: true,
            filter: true,
            filterElement: symbolFilter,
            style: { 'minWidth': '50px', width: '100px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "timeFrameStr",
            header: "Time Frame",
            sortable: true,
            filter: true,
            filterElement: timeFrameFilter,
            style: { 'minWidth': '50px', width: '80px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "type",
            header: "Div Type",
            sortable: true,
            filter: true,
            filterElement: divergenceTypeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.type),
            style: { 'minWidth': '50px', width: '70px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "startDate",
            header: "Div Start",
            sortable: true,
            filter: true,
            filterElement: divergenceStartDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "endDate",
            header: "Div End",
            sortable: true,
            filter: true,
            filterElement: divergenceEndDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "macdStartDate",
            header: "MACD Start",
            sortable: true,
            filter: true,
            filterElement: macdStartDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "macdEndDate",
            header: "MACD End",
            sortable: true,
            filter: true,
            filterElement: macdEndDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "prerequisiteId",
            header: "Prerequisite Id",
            sortable: true,
            filter: true,
            filterElement: prerequisiteIdFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.prerequisiteId),
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "refCandleDate",
            header: "RefCandle Date",
            sortable: true,
            filter: true,
            filterElement: refCandleDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            columnKey: "actions",
            header: "Actions",
            body: actionBodyTemplate,
            style: { 'minWidth': '50px', width: '120px' },
            bodyStyle: { justifyContent: 'center', overflow: 'visible' }
        }
    ]

    const serverCustomableFilters = [
        {
            name: "symbol",
            label: "Symbols",
            type: FilterType.MultiSelect,
            options: exchangeSymbols,
            state: selectedServerSymbols,
            setState: setSelectedServerSymbols
        },
        {
            name: "timeFrame",
            label: "Time Frame",
            type: FilterType.DropDown,
            options: intervals,
            state: selectedServerInterval,
            setState: setSelectedServerInterval
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
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(missedPrePos, "missedprepos")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-missedprepos" setSortState={setMultiSortMeta}
                onSave={() => setMissedPrePos(prevState => [...prevState])} />
        </div>
    );

    return (
        <div id="missedprepos-container">
            <Toast ref={toast} />
            <ConfirmDialog visible={displayDeleteDialog} onHide={() => setDisplayDeleteDialog(false)} message="Are you sure you want to Delete it?"
                header="Confirmation" icon="pi pi-exclamation-triangle" accept={acceptDeleteEngine} reject={() => setDisplayDeleteDialog(false)} />
            <Dialog header="Numeric Filter" visible={displayNumericFilterDialogForDecimal} footer={renderFooter('decimal')} onHide={() => onNumericFilterHide('decimal')} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
                <div className="grid p-formgrid p-fluid">
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="filter">Filter:</label>
                        <Dropdown id='numberFilter' value={selectedNumericFilterType} options={numericFilterType} filter showClear
                            onChange={(e) => setSelectedNumericFilterType(e.value)} placeholder="Select a filter" />
                    </div>
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="decimalNumberonly">Number:</label>
                        <InputNumber inputId="decimalNumberonly" mode="decimal" minFractionDigits={1} maxFractionDigits={4} value={selectedNumericFilterValue} onChange={(e) => setSelectedNumericFilterValue(e.value)} />
                    </div>
                </div>
            </Dialog >
            <Dialog header="Numeric Filter" visible={displayNumericFilterDialogForInteger} footer={renderFooter('integer')} onHide={() => onNumericFilterHide('integer')} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
                <div className="grid p-formgrid p-fluid">
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="filter">Filter:</label>
                        <Dropdown id='numberFilter' value={selectedNumericFilterType} options={numericFilterType} filter showClear
                            onChange={(e) => setSelectedNumericFilterType(e.value)} placeholder="Select a filter" />
                    </div>
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="integerNumberonly">Number:</label>
                        <InputNumber inputId="integerNumberonly" value={selectedNumericFilterValue} onChange={(e) => setSelectedNumericFilterValue(e.value)} />
                    </div>
                </div>
            </Dialog >
            <Dialog header="Text Filter" visible={displayTextFilterDialog} footer={textRenderFooter()} onHide={() => onTextFilterHide()} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
                <div className="grid p-formgrid p-fluid">
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="stringFilter">Filter:</label>
                        <Dropdown id='stringFilter' value={selectedTextFilterType} options={textFilterType} filter showClear
                            onChange={(e) => setSelectedTextFilterType(e.value)} placeholder="Select a filter" />
                    </div>
                    <div className="p-field col-10 md:col-5">
                        <label htmlFor="textId">Value:</label>
                        <InputText id="textId" value={selectedTextFilterValue} onChange={(e) => setSelectedTextFilterValue(e.target.value)} />
                    </div>
                </div>
            </Dialog >
            <Card style={{ width: '100%', marginBottom: '2em' }}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverSymbol" className="align-self-baseline">Symbols</label>
                        <div className="w-full flex align-self-end">
                            <MultiSelect id='serverSymbol' value={selectedServerSymbols} options={symbols} filter showClear
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="w-full align-self-end" />
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                            onChange={(e) => setSelectedServerInterval(e.value)} placeholder="Select a Time Frame" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-6 hidden lg:block"></div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStartDate" className="align-self-baseline">From Date</label>
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
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-missedprepos"
                            onSave={loadData} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={missedPrePos} className={"p-datatable-sm"} scrollable showGridlines filterDisplay="row" scrollDirection="both"
                    selection={selectedDivergences} onSelectionChange={e => setSelectedDivergences(e.value)}
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" filters={datatableFilters} onFilter={onCustomFilter}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-missedprepos", filteredColumns)}

                </DataTable>
            </div>
        </div>);
}

export default MissedPrePos;