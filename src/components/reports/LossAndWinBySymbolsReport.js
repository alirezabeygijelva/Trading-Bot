import React from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { filterHelper } from '../../utils/FilterHelper';
import { templates } from '../../utils/Templates';
import { columnHelper } from '../../utils/ColumnHelper';
import LabelWithValue from '../LabelWithValue';
import Paginator from '../../components/Paginator';
import Export from '../../components/Export';
import ColumnManager from '../../components/ColumnManager';
import { exchangeServices } from '../../services/ExchangeServices';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import '../../assets/scss/LossesAndWinsReport.scss'
import { Divider } from 'primereact/divider';
import FiltersStatement from '../FiltersStatement';
import { IntervalHelper } from '../../utils/IntervalHelper';

//REPORT 2 (Statistical)
const LossesAndWinsReport = () => {
    const pg = React.useRef(null);
    const dt = React.useRef(null);
    const cm = React.useRef(null);
    const state = window.localStorage.getItem("server-filters-losswins-bysymbol");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const [lossesAndWins, setLossesAndWins] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [first, setFirst] = React.useState(0);
    const [rows, setRows] = React.useState(10);
    const [symbolsCount, setSymbolsCount] = React.useState(0);
    const [totalPositionsCount, setTotalPositionsCount] = React.useState(0);
    const [currentPositionsCount, setCurrentPositionsCount] = React.useState(0);
    const [positionsDuration, setPositionsDuration] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [realCommissionSum, setRealCommissionSum] = React.useState(0);
    const [calculatedCommissionSum, setCalculatedCommissionSum] = React.useState(0);
    const [totalCountSum, setTotalCountSum] = React.useState(0);
    const [winCountSum, setWinCountSum] = React.useState(0);
    const [lossCountSum, setLossCountSum] = React.useState(0);
    const [winRatioAvg, setWinRatioAvg] = React.useState(0);
    const [scoreAvg, setScoreAvg] = React.useState(0);
    const [rewardToRiskSum, setRewardToRiskSum] = React.useState(0);
    const [rewardToRiskAvg, setRewardToRiskAvg] = React.useState(0);
    const [exchangeTotalCountSum, setExchangeTotalCountSum] = React.useState(0);
    const [exchangeWinCountSum, setExchangeWinCountSum] = React.useState(0);
    const [exchangeLossCountSum, setExchangeLossCountSum] = React.useState(0);
    const [exchangeWinRatioAvg, setExchangeWinRatioAvg] = React.useState(0);
    const [exchangeScoreAvg, setExchangeScoreAvg] = React.useState(0);
    const [exchangeRewardToRiskSum, setExchangeRewardToRiskSum] = React.useState(0);
    const [exchangeRewardToRiskAvg, setExchangeRewardToRiskAvg] = React.useState(0);
    const [exchangeCommissionSum, setExchangeCommissionSum] = React.useState(0);
    const [selectedSymbols, setSelectedSymbols] = React.useState([]);
    const [selectedInterval, setSelectedInterval] = React.useState([]);
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
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = React.useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = React.useState(null);
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = React.useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = React.useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = React.useState(null);
    const [filteredColumns, setFilteredColumns] = React.useState([]);
    const [datatableFilters, setDatatableFilters] = React.useState({});
    const [multiSortMeta, setMultiSortMeta] = React.useState([]);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [reportData, setReportData] = React.useState({});
    const [numericColumnComparisonType, setNumericColumnComparisonType] = React.useState({
        totalCount: '',
        winCount: '',
        lossCount: '',
        winRatio: '',
        rewardToRiskSum: '',
        rewardToRiskAvg: '',
        realCommissionSum: '',
        calculatedCommissionSum: '',
        commissionR: '',
        rewardToRiskPure: '',
        exchangeTotalCount: '',
        exchangeWinCount: '',
        exchangeLossCount: '',
        exchangeWinRatio: '',
        exchangeRewardToRiskSum: '',
        exchangeRewardToRiskAvg: '',
        exchangeCommissionSum: '',
        exchangeRewardToRiskPure: '',
        exchangeCommissionR: '',
    });

    const numericFilterType = [
        { label: 'Greater than', value: '>' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than', value: '<' },
        { label: 'Less than or equal to', value: '<=' },
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
        {
            label: 'Copy Column Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copyColumn(filteredData, selectedContent.originalEvent.target.classList[0])
        }
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

        scalpServices.getLossesAndWinsReport(strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerIsExchangeData
            , selectedServerReasonsToNotEnter).then(data => {
                setRows(data.lossesAndWinsListItems?.length ?? 10);
                setReportData(data);
                setLossesAndWins(data.lossesAndWinsListItems);
                setFilteredData(data.lossesAndWinsListItems);
                setSymbolsCount(data.symbolsCount);
                setTotalPositionsCount(data.totalPositionsCount);
                setCurrentPositionsCount(data.currentPositionsCount);
                setStartDate(data.startDate);
                setEndDate(data.endDate);
                setPositionsDuration(data.positionsDuration);
                setRealCommissionSum(data.realCommissionSum);
                setCalculatedCommissionSum(data.calculatedCommissionSum);
                setTotalCountSum(data.totalCountSum);
                setWinCountSum(data.winCountSum);
                setLossCountSum(data.lossCountSum);
                setWinRatioAvg(data.winRatioAvg);
                setScoreAvg(data.scoreAvg);
                setRewardToRiskSum(data.rewardToRiskSum);
                setRewardToRiskAvg(data.rewardToRiskAvg);
                setExchangeTotalCountSum(data.exchangeTotalCountSum);
                setExchangeWinCountSum(data.exchangeWinCountSum);
                setExchangeLossCountSum(data.exchangeLossCountSum);
                setExchangeWinRatioAvg(data.exchangeWinRatioAvg);
                setExchangeScoreAvg(data.exchangeScoreAvg);
                setExchangeRewardToRiskSum(data.exchangeRewardToRiskSum);
                setExchangeRewardToRiskAvg(data.exchangeRewardToRiskAvg);
                setExchangeCommissionSum(data.exchangeCommissionSum);
                setLoading(false);
            });
    }

    const onSymbolChange = (e) => {
        dt.current.filter(e.value, 'symbol', 'in');
        setSelectedSymbols(e.value);
    }

    const onIntervalChange = (e) => {
        dt.current.filter(e.value, 'timeFrameStr', 'equals');
        setSelectedInterval(e.value);
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

    const reset = () => {
        setSelectedSymbols(null);
        setSelectedInterval(null);
        setNumericColumnComparisonType({
            totalCount: '',
            winCount: '',
            lossCount: '',
            winRatio: '',
            rewardToRiskSum: '',
            rewardToRiskAvg: '',
            realCommissionSum: '',
            calculatedCommissionSum: '',
            commissionR: '',
            rewardToRiskPure: '',
            exchangeTotalCount: '',
            exchangeWinCount: '',
            exchangeLossCount: '',
            exchangeWinRatio: '',
            exchangeRewardToRiskSum: '',
            exchangeRewardToRiskAvg: '',
            exchangeCommissionSum: '',
            exchangeRewardToRiskPure: '',
            exchangeCommissionR: '',
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
    const totalCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('totalCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('totalCount')} />
        </span>
    const winCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winCount')} />
        </span>
    const lossCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('lossCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('lossCount')} />
        </span>
    const winRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatio', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatio')} />
        </span>
    const rewardToRiskSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskSum')} />
        </span>
    const commissionRFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('commissionR', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('commissionR')} />
        </span>
    const rewardToRiskAvgFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskAvg', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskAvg')} />
        </span>
    const realCommissionSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('realCommissionSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('realCommissionSum')} />
        </span>
    const calculatedCommissionSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedCommissionSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedCommissionSum')} />
        </span>
    const rewardToRiskPureFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskPure', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskPure')} />
        </span>

    const exchangeTotalCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeTotalCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeTotalCount')} />
        </span>
    const exchangeWinCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinCount')} />
        </span>
    const exchangeLossCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeLossCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeLossCount')} />
        </span>
    const exchangeWinRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRatio', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRatio')} />
        </span>
    const exchangeRewardToRiskSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeRewardToRiskSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeRewardToRiskSum')} />
        </span>
    const exchangeCommissionRFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCommissionR', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCommissionR')} />
        </span>
    const exchangeRewardToRiskAvgFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeRewardToRiskAvg', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeRewardToRiskAvg')} />
        </span>
    const exchangeCommissionSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCommissionSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCommissionSum')} />
        </span>
    const exchangeRewardToRiskPureFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeRewardToRiskPure', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeRewardToRiskPure')} />
        </span>

    const columns = [
        {
            ...columnHelper.defaultColumn,
            columnKey: "rowNumber",
            style: { 'minWidth': '50px', width: '55px' },
            body: (col, context) => context.rowIndex + 1,
            header: "#"
        },
        {
            ...columnHelper.defaultColumn,
            field: "symbol",
            header: "Symbol",
            sortable: true,
            filter: true,
            filterElement: symbolFilter,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "timeFrameStr",
            header: "Time Frame",
            sortable: true,
            filter: true,
            filterElement: timeFrameFilter,
            style: { 'minWidth': '50px', width: '110px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "totalCount",
            header: "Total Count",
            sortable: true,
            filter: true,
            filterElement: totalCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.totalCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winCount",
            header: "Win Count",
            sortable: true,
            filter: true,
            filterElement: winCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "lossCount",
            header: "Loss Count",
            sortable: true,
            filter: true,
            filterElement: lossCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.lossCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            filter: true,
            filterElement: winRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRatio),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "score",
            header: "Score",
            sortable: true,
            filter: true,
            filterElement: winRatioFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.score),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskAvg",
            header: "R/R Avg",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskAvgFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.rewardToRiskAvg),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "R/R Sum",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskSumFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.rewardToRiskSum),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "commissionR",
            header: "Commission(R)",
            sortable: true,
            filter: true,
            filterElement: commissionRFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.commissionR),
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskPure",
            header: "R/R Pure",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskPureFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.rewardToRiskPure),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "realCommissionSum",
            header: "Commission Sum",
            sortable: true,
            filter: true,
            filterElement: realCommissionSumFilter,
            body: (rowData, raw) => templates.digitDollarBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.realCommissionSum),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedCommissionSum",
            header: "Calculated Commission Sum",
            sortable: true,
            filter: true,
            filterElement: calculatedCommissionSumFilter,
            body: (rowData, raw) => templates.digitDollarBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedCommissionSum),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeTotalCount",
            header: "Exchange Total Count",
            sortable: true,
            filter: true,
            filterElement: exchangeTotalCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeTotalCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            headerClassName: "exchange-col",
            style: { 'minWidth': '50px', width: '100px' },
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeWinCount",
            header: "Exchange Win Count",
            sortable: true,
            filter: true,
            filterElement: exchangeWinCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            headerClassName: "exchange-col",
            style: { 'minWidth': '50px', width: '100px' },
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeLossCount",
            header: "Exchange Loss Count",
            sortable: true,
            filter: true,
            filterElement: exchangeLossCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeLossCount),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            headerClassName: "exchange-col",
            style: { 'minWidth': '50px', width: '100px' },
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeWinRatio",
            header: "Exchange Win Ratio",
            sortable: true,
            filter: true,
            filterElement: exchangeWinRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRatio),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            headerClassName: "exchange-col",
            style: { 'minWidth': '50px', width: '100px' },
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeScore",
            header: "Exchange Score",
            sortable: true,
            filter: true,
            filterElement: exchangeWinRatioFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeScore),
            style: { 'minWidth': '50px', width: '100px' },
            headerClassName: "exchange-col",
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeRewardToRiskAvg",
            header: "Exchange R/R Avg",
            sortable: true,
            filter: true,
            filterElement: exchangeRewardToRiskAvgFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeRewardToRiskAvg),
            style: { 'minWidth': '50px', width: '100px' },
            headerClassName: "exchange-col",
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeRewardToRiskSum",
            header: "Exchange R/R Sum",
            sortable: true,
            filter: true,
            filterElement: exchangeRewardToRiskSumFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeRewardToRiskSum),
            style: { 'minWidth': '50px', width: '100px' },
            headerClassName: "exchange-col",
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeCommissionR",
            header: "Exchange Commission(R)",
            sortable: true,
            filter: true,
            filterElement: exchangeCommissionRFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCommissionR),
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeRewardToRiskPure",
            header: "Exchange R/R Pure",
            sortable: true,
            filter: true,
            filterElement: exchangeRewardToRiskPureFilter,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeRewardToRiskPure),
            style: { 'minWidth': '50px', width: '100px' },
            headerClassName: "exchange-col",
            className: "exchange-col"
        },
        {
            ...columnHelper.defaultColumn,
            field: "exchangeCommissionSum",
            header: "Exchange Commission Sum",
            sortable: true,
            filter: true,
            filterElement: exchangeCommissionSumFilter,
            body: (rowData, raw) => templates.digitDollarBodyTemplate(rowData, raw, 2),
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCommissionSum),
            style: { 'minWidth': '50px', width: '100px' },
            headerClassName: "exchange-col",
            className: "exchange-col"
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
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(lossesAndWins, "loss-and-win")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-losswins-bysymbol" setSortState={setMultiSortMeta}
                onSave={() => setLossesAndWins(prevState => [...prevState])} />
        </div>
    );

    return (
        <div id="loss-and-win-report">
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
            <Card style={{ width: '100%', marginBottom: '1em' }}>
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
                        <label htmlFor="registeredInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='registeredInterval' value={selectedServerInterval} options={intervals} showClear
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
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-losswins-bysymbol"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid">
                    <Divider align="left" type="dashed"><b>Bot</b></Divider>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Count Sum" value={totalCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Win Count Sum" value={winCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Loss Count Sum" value={lossCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Win Ratio Avg" value={contentHelper.digitFormat(winRatioAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Score Avg" value={contentHelper.digitFormat(scoreAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="R/R Avg" value={contentHelper.digitFormat(rewardToRiskAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="R/R Sum" value={contentHelper.digitFormat(rewardToRiskSum, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Commission(R) Sum" value={contentHelper.digitFormat(reportData.commissionRSum ?? 0, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Pure R/R Sum" value={contentHelper.digitFormat(reportData.pureRewardToRiskSum ?? 0, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Real Commission Sum" value={contentHelper.digitFormat(realCommissionSum, 2)} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Calculated Commission Sum" value={contentHelper.digitFormat(calculatedCommissionSum, 2)} prefix="$" />
                    </div>

                    <Divider align="left" type="dashed"><b>Market</b></Divider>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Total Count Sum" value={exchangeTotalCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Win Count Sum" value={exchangeWinCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Loss Count Sum" value={exchangeLossCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Win Ratio Avg" value={contentHelper.digitFormat(exchangeWinRatioAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Score Avg" value={contentHelper.digitFormat(exchangeScoreAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange R/R Avg" value={contentHelper.digitFormat(exchangeRewardToRiskAvg, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange R/R Sum" value={contentHelper.digitFormat(exchangeRewardToRiskSum, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Commission(R) Sum" value={contentHelper.digitFormat(reportData.exchangeCommissionRSum ?? 0, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Pure R/R Sum" value={contentHelper.digitFormat(reportData.exchangePureRewardToRiskSum ?? 0, 2)} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Commission Sum" value={contentHelper.digitFormat(exchangeCommissionSum, 2)} prefix="$" />
                    </div>

                    <hr className="col-12 md:col-12 lg:col-12" />

                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={totalPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Current Positions Count" value={currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Symbols Count" value={symbolsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={endDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Duration" value={positionsDuration} />
                    </div>

                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={lossesAndWins} className={"p-datatable-sm"} scrollable showGridlines filterDisplay="row" scrollDirection="both"
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" filters={datatableFilters} onFilter={onCustomFilter}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    rowClassName={() => { return { 'row-hover': true } }}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    onContextMenu={e => cm.current.show(e.originalEvent)}
                    cellClassName={(data, options) => `${options.field} text-center`}
                    onValueChange={e => setFilteredData(e)}>

                    {columnHelper.generatColumns(columns, "dt-state-losswins-bysymbol", filteredColumns)}

                </DataTable>
            </div>
        </div>);
}

export default LossesAndWinsReport;