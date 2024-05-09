import React from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { Tooltip } from 'primereact/tooltip';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { filterHelper } from '../../utils/FilterHelper';
import { templates } from '../../utils/Templates';
import { visibilityDetector } from '../../utils/VisibilityDetector';
import { sortHelper } from '../../utils/SortHelper';
import Export from '../../components/Export';
import { columnHelper } from '../../utils/ColumnHelper';
import { QuickActionsContext } from '../../contexts/QuickActionsContext';
import LabelWithValue from '../LabelWithValue';
import Paginator from '../../components/Paginator';
import ColumnManager from '../../components/ColumnManager';
import { exchangeServices } from '../../services/ExchangeServices';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import '../../assets/scss/StoppedPositionsReport.scss';
import FiltersStatement from '../FiltersStatement';
import { IntervalHelper } from '../../utils/IntervalHelper';

//REPORT 7 (Statistical)
const StoppedPositionsReport = () => {
    const state = window.localStorage.getItem("server-filters-stoppedpositions");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const pg = React.useRef(null);
    const dt = React.useRef(null);
    const cm = React.useRef(null);
    const { addItems, clearItem } = React.useContext(QuickActionsContext);
    const navigate = useNavigate();
    const [selectedPositions, setSelectedPositions] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [first, setFirst] = React.useState(0);
    const [rows, setRows] = React.useState(10);
    const [selectedSymbols, setSelectedSymbols] = React.useState([]);
    const [selectedInterval, setSelectedInterval] = React.useState([]);
    const [selectedDivergenceStartDate, setSelectedDivergenceStartDate] = React.useState([]);
    const [selectedDivergenceEndDate, setSelectedDivergenceEndDate] = React.useState([]);
    const [selectedRefCandleDate, setSelectedRefCandleDate] = React.useState([]);
    const [selectedTriggerDate, setSelectedTriggerDate] = React.useState([]);
    const [selectedExitDate, setSelectedExitDate] = React.useState([]);
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = React.useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = React.useState(null);
    const [selectedTextFilterType, setSelectedTextFilterType] = React.useState(null);
    const [selectedTextFilterValue, setSelectedTextFilterValue] = React.useState('');
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = React.useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = React.useState(false);
    const [displayTextFilterDialog, setDisplayTextFilterDialog] = React.useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = React.useState(null);
    const [displayTextColumnFilter, setDisplayTextColumnFilter] = React.useState(null);
    const [filteredColumns, setFilteredColumns] = React.useState([]);
    const [datatableFilters, setDatatableFilters] = React.useState({});
    const [data, setData] = React.useState({});
    const [numericColumnComparisonType, setNumericColumnComparisonType] = React.useState({
        id: '',
    });
    const [textColumnComparisonType, setTextColumnComparisonType] = React.useState({
        divergenceType: '',
        positionType: '',
    });
    const [multiSortMeta, setMultiSortMeta] = React.useState([]);

    const numericFilterType = [
        { label: 'Greater than', value: '>' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than', value: '<' },
        { label: 'Less than or equal to', value: '<=' },
        { label: 'equal', value: '===' },
        { label: 'Not equal', value: '!==' }
    ];

    const textFilterType = [
        { label: 'equal', value: '===' },
        { label: 'Not equal', value: '!==' }
    ];

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const intervals = IntervalHelper.intervalsList();

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

    const [filterStatement, setFilterStatement] = React.useState([]);
    React.useEffect(() => {
        var filtersStatement = [];
        if (selectedServerStrategies && selectedServerStrategies.length !== 0) {
            filtersStatement.push({
                name: "Strategies: ",
                description: (selectedServerStrategies.length === 1
                    ? `Positions filtered based on strategy <strong>${strategies.find(x => x.value === selectedServerStrategies[0])?.label ?? ""}</strong>`
                    : `Positions filtered based on <strong>${selectedServerStrategies.length}</strong> strategies`)
            })
        }
        if (selectedServerBacktests && selectedServerBacktests.length !== 0) {
            filtersStatement.push({
                name: "Backtests: ",
                description: (selectedServerBacktests.length === 1
                    ? `Positions filtered based on backtest <strong>${backtests.find(x => x.value === selectedServerBacktests[0])?.label ?? ""}</strong>`
                    : `Positions filtered based on <strong>${selectedServerBacktests.length}</strong> backtests`)
            })
        }
        if (selectedServerSymbols && selectedServerSymbols.length !== 0) {
            filtersStatement.push({
                name: "Symbols: ",
                description: (selectedServerSymbols.length === 1
                    ? `Positions filtered based on symbol <strong>${selectedServerSymbols}</strong>`
                    : `Positions filtered based on <strong>${selectedServerSymbols.length}</strong> symbols`)
            })
        }
        if (selectedServerInterval) {
            filtersStatement.push({
                name: "Time Frame: ",
                description: `positions filtered based on time frame <strong>${selectedServerInterval}</strong>`
            })
        }
        if (selectedServerIsRegisteredInMarket) {
            filtersStatement.push({
                name: "Is Registered In Market: ",
                description: (selectedServerIsRegisteredInMarket === 'true'
                    ? `Get positions <strong>registered</strong> in the market`
                    : `Get positions <strong>not registered</strong> in the market`)
            })
        }
        if (selectedServerStartDate && selectedServerEndDate) {
            let time = selectedServerStartTime.split(":");
            selectedServerStartDate.setHours(time[0])
            selectedServerStartDate.setMinutes(time[1])
            selectedServerStartDate.setSeconds(time[2])
            time = selectedServerEndTime.split(":");
            selectedServerEndDate.setHours(time[0])
            selectedServerEndDate.setMinutes(time[1])
            selectedServerEndDate.setSeconds(time[2])
            filtersStatement.push({
                name: "Date & Time: ",
                description: `Get positions recorded from <strong>${selectedServerStartDate.toString().split('+')[0]}</strong> `
                    + `to <strong>${selectedServerEndDate.toString().split('+')[0]}</strong>`
            })
        }
        if (selectedServerReasonsToNotEnter && selectedServerReasonsToNotEnter.length !== 0) {
            filtersStatement.push({
                name: "Reason To Not Enter: ",
                description: (selectedServerReasonsToNotEnter.length === 1
                    ? `Get positions that didn't enter the market with reason '<strong>${selectedServerReasonsToNotEnter}</strong>'`
                    : `Get positions that didn't enter the market with <strong>${selectedServerReasonsToNotEnter.length}</strong> reasons`)
            })
        }
        filtersStatement.push({
            name: "Is Exchange Data?: ",
            description: (selectedServerIsExchangeData === 'true'
                ? `Get bot's wins or losses positions that registered in Exchange and synced with Exchange's positions'`
                : `Get bot's wins or losses positions that didn't register in Exchange or didn't sync with Exchange's positions`)
        })
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter, selectedServerIsExchangeData]);

    React.useEffect(() => {
        return () => {
            clearItem();
        };
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        addItems(
            [{
                itemId: 'stopped-positions-show-on-chart',
                label: 'Show on Chart',
                icon: 'pi pi-chart-bar',
                className: 'p-button-success',
                command: showOnChart,
                template: (item, options) => {
                    return (
                        <React.Fragment>
                            <Tooltip target={`.${item.itemId}`} position="left" />
                            <Button id='floatingShowChart'
                                onClick={options.onClick} data-pr-tooltip={item.label}
                                className={classNames(item.itemId, options.iconClassName, options.className, item.className)} />
                        </React.Fragment>
                    );
                }
            }]);
    }, [selectedPositions]);// eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (selectedServerStrategies && selectedServerStrategies.length > 0) {
            setSelectedServerBacktests([])
        }
    }, [selectedServerStrategies]);
    React.useEffect(() => {
        if (selectedServerBacktests && selectedServerBacktests.length > 0) {
            setSelectedServerStrategies([])
        }
    }, [selectedServerBacktests]);

    React.useEffect(() => {
        visibilityDetector.attach('stopped-positions-report');
        setSelectedPositions(null);
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
        });
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });

        scalpServices.getReasonsToNotEnter().then(data => {
            setReasonsToNotEnter(data);
        });

        scalpServices.getStrategiesDropDown().then(data => {
            setStrategies(data);
            if (filtersDefValue.filterStrategyType === "Strategy" && data.length >= (filtersDefValue.strategies ?? 1)) {
                var strategies = data[(filtersDefValue.strategies ?? 1) - 1].value;
                setSelectedServerStrategies([strategies]);
            }
        });
        scalpServices.getBacktestsDropDown().then(data => {
            setBacktests(data);
            if (filtersDefValue.filterStrategyType === "Backtest" && data.length >= (filtersDefValue.backtests ?? 1)) {
                var backtests = data[(filtersDefValue.backtests ?? 1) - 1].value;
                setSelectedServerBacktests([backtests]);
            }
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setLoading(true);
        var start = null;
        var end = null;
        let symbols = null;
        let strategies = null;
        let backtests = null;

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

        if (selectedServerSymbols && selectedServerSymbols.length > 0)
            symbols = selectedServerSymbols.join();

        if (selectedServerStrategies && selectedServerStrategies.length > 0)
            strategies = selectedServerStrategies.join();
        if (selectedServerBacktests && selectedServerBacktests.length > 0)
            backtests = selectedServerBacktests.join();

        scalpServices.getStoppedPositionsReport(strategies, backtests, symbols, selectedServerInterval, start, end
            , selectedServerIsRegisteredInMarket, selectedServerIsExchangeData, selectedServerReasonsToNotEnter).then(data => {
                setRows(data.positions?.length ?? 10);
                setData(data);
                setLoading(false);
            });
    }


    const showOnChart = () => {
        if (selectedPositions) {
            navigate('/chart', {
                state: { positionsToShow: selectedPositions }
            });
        }
    }

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

    const onRefCandleDateChange = (e) => {
        dt.current.filter(e.value, 'refCandleDate', 'custom');
        setSelectedRefCandleDate(e.value);
    }

    const onTriggerDateChange = (e) => {
        dt.current.filter(e.value, 'triggerDate', 'custom');
        setSelectedTriggerDate(e.value);
    }

    const onExitDateChange = (e) => {
        dt.current.filter(e.value, 'exitDate', 'custom');
        setSelectedExitDate(e.value);
    }


    //#region Start Numeric Filter
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
    //#endregion End Filter

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
        setSelectedRefCandleDate(null);
        setSelectedTriggerDate(null);
        setSelectedExitDate(null);
        setNumericColumnComparisonType({
            id: '',
        });
        setTextColumnComparisonType({
            divergenceType: '',
            positionType: '',
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

    const symbolFilter = <MultiSelect value={selectedSymbols} options={symbols} onChange={onSymbolChange} placeholder="Select a Symbol" className="p-column-filter multiselect-custom" filter showClear />;
    const timeFrameFilter = <Dropdown value={selectedInterval} options={intervals} onChange={onIntervalChange} placeholder="Select a Time Frame" className="p-column-filter" filter showClear />;
    const divergenceStartDateFilter = <Calendar value={selectedDivergenceStartDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceStartDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const divergenceEndDateFilter = <Calendar value={selectedDivergenceEndDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceEndDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const refCandleDateFilter = <Calendar value={selectedRefCandleDate} selectionMode="range" showIcon showButtonBar onChange={onRefCandleDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const triggerDateFilter = <Calendar value={selectedTriggerDate} selectionMode="range" showIcon showButtonBar onChange={onTriggerDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const exitDateFilter = <Calendar value={selectedExitDate} selectionMode="range" showIcon showButtonBar onChange={onExitDateChange} dateFormat="dd/mm/yy" showTime showSeconds />

    const idFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('id', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('id')} />
        </span>
    const divergenceTypeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('divergenceType')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('divergenceType')} />
        </span>
    const positionTypeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('positionType')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('positionType')} />
        </span>


    const columns = [
        {
            ...columnHelper.defaultColumn,
            reorderable: false,
            columnKey: "multipleSelection",
            selectionMode: "multiple",
            style: { width: '3em' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "symbol",
            header: "Symbol",
            sortable: true,
            filter: true,
            filterElement: symbolFilter,
            style: { 'minWidth': '50px', width: '120px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "timeFrameStr",
            header: "Time Frame",
            sortable: true,
            filter: true,
            filterElement: timeFrameFilter,
            style: { 'minWidth': '50px', width: '110px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "divergenceStartDate",
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
            field: "divergenceEndDate",
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
            field: "refCandleDate",
            header: "Ref Candle",
            sortable: true,
            filter: true,
            filterElement: refCandleDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "divergenceType",
            header: "Div Type",
            sortable: true,
            filter: true,
            filterElement: divergenceTypeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.divergenceType),
            style: { 'minWidth': '50px', width: '50px' },
            bodyStyle: { justifyContent: 'center' },
            body: templates.digitBodyTemplate
        },

        {
            ...columnHelper.defaultColumn,
            field: "positionType",
            header: "Position Type",
            sortable: true,
            filter: true,
            filterElement: positionTypeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.positionType),
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "triggerDate",
            header: "Trigger Date",
            sortable: true,
            filter: true,
            filterElement: triggerDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "exitDate",
            header: "Exit Date",
            filter: true,
            filterElement: exitDateFilter,
            sortable: true,
            sortFunction: (event) => sortHelper.sort(event, data.positions),
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "id",
            header: "Id",
            sortable: true,
            filter: true,
            filterElement: idFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.id),
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },
    ]

    const serverCustomableFilters = [
        {
            name: "strategies",
            label: "Strategies",
            type: FilterType.Couter,
            options: strategies,
            state: selectedServerStrategies,
            setState: setSelectedServerStrategies
        },
        {
            name: "backtests",
            label: "Back tests",
            type: FilterType.Couter,
            options: backtests,
            state: selectedServerBacktests,
            setState: setSelectedServerBacktests
        },
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
            name: "isRegisteredInMarket",
            label: "Is Registered In Market?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsRegisteredInMarket,
            setState: setSelectedServerIsRegisteredInMarket
        },
        {
            name: "isExchangeData",
            label: "Is Exchange Data?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsExchangeData,
            setState: setSelectedServerIsExchangeData
        },
        {
            name: "reasonsToNotEnter",
            label: "Reasons To Not Enter",
            type: FilterType.MultiSelect,
            options: reasonsToNotEnter,
            state: selectedServerReasonsToNotEnter,
            setState: setSelectedServerReasonsToNotEnter
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
            <Button icon="pi pi-chart-bar" label="Show on chart" id='showChart' className="p-button-success mr-2" onClick={showOnChart} />
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(data.positions, "stopped-positions")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-stoppedpositions" setSortState={setMultiSortMeta}
                onSave={() => setData(prevState => ({ ...prevState }))} />
        </div>
    );

    return (
        <div id="stopped-positions-report">
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
                        <label htmlFor="serverStrategy" className="align-self-baseline">Strategy</label>
                        <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                            onChange={(e) => setSelectedServerStrategies(e.value)} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverBacktests" className="align-self-baseline">Backtests</label>
                        <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                            onChange={(e) => setSelectedServerBacktests(e.value)} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsExchangeData" className="align-self-baseline">Is Exchange Data?</label>
                        <Dropdown id='serverIsExchangeData' value={selectedServerIsExchangeData} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsExchangeData(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-stoppedpositions"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={data.totalPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Current Positions Count" value={data.currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4"></div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={data.startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={data.endDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Duration" value={data.duration} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={data.positions} className={"p-datatable-sm"} scrollable showGridlines filterDisplay="row" scrollDirection="both"
                    selection={selectedPositions} onSelectionChange={e => setSelectedPositions(e.value)}
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" filters={datatableFilters} onFilter={onCustomFilter}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-stoppedpositions", filteredColumns)}

                </DataTable>
            </div>
        </div>);
}

export default StoppedPositionsReport;