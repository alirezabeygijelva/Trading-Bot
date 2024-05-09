import React, { useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ContextMenu } from 'primereact/contextmenu';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Fieldset } from 'primereact/fieldset';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { InputSwitch } from 'primereact/inputswitch';
import { dateHelper } from '../utils/DateHelper';
import { contentHelper } from '../utils/ContentHelper';
import { templates } from '../utils/Templates';
import { visibilityDetector } from '../utils/VisibilityDetector';
import { scalpServices } from '../services/ScalpServices';
import { Card } from 'primereact/card';
import { columnHelper } from '../utils/ColumnHelper';
import { FilterType } from '../utils/FilterType';
import { exchangeServices } from '../services/ExchangeServices';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { filterHelper } from '../utils/FilterHelper';
import { Divider } from 'primereact/divider';
import LabelWithValue from '../components/LabelWithValue';
import Export from '../components/Export';
import Paginator from '../components/Paginator';
import ColumnManager from '../components/ColumnManager';
import FilterManager from '../components/FilterManager';
import PositionTable from '../components/PositionTable';
import '../assets/scss/FinanceManagement.scss';
import { IntervalHelper } from '../utils/IntervalHelper';
import { TabView, TabPanel } from 'primereact/tabview';
import PropTypes from 'prop-types';
import { set } from 'lodash';
import { async } from 'rxjs';

const FinanceManagement = () => {
    return (
        <div className="card">
            <TabView>
                <TabPanel header="Live">
                    <FinanceManagementComponent isLive={true} />
                </TabPanel>
                <TabPanel header="Backtest">
                    <FinanceManagementComponent isLive={false} />
                </TabPanel>

            </TabView>
        </div>

    )
}
export default FinanceManagement

const FinanceManagementComponent = ({ isLive }) => {
    const state = window.localStorage.getItem("server-filters-finance-management");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const pg = React.useRef(null);
    const pack = React.useRef(null);
    const isMounted = React.useRef(false);
    const cm = React.useRef(null);
    const [loading, setLoading] = React.useState(false);
    const [packsLoading, setPacksLoading] = React.useState(false);
    const [positionsLoading, setPositionsLoading] = React.useState(false);
    const [financeData, setFinanceData] = React.useState({});
    const [positionsData, setPositionsData] = React.useState(null);
    const [first, setFirst] = React.useState(0);
    const [rows, setRows] = React.useState(10);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIncludePositionsRecords, setSelectedServerIncludePositionsRecords] = React.useState(filtersDefValue.includePositionsRecords ?? false);
    const [selectedServerGroupBySymbols, setSelectedServerGroupBySymbols] = React.useState(filtersDefValue.groupBySymbols ?? false);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerTriggerStartDate, setSelectedServerTriggerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 90, filtersDefValue.startDate?.type ?? 'days').toDate()));
    const [selectedServerTriggerStartTime, setSelectedServerTriggerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerTriggerEndDate, setSelectedServerTriggerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate()));
    const [selectedServerTriggerEndTime, setSelectedServerTriggerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerIsSucceed, setSelectedServerIsSucceed] = React.useState(filtersDefValue.isSucceed);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerHasDoubleDivergences, setSelectedServerHasDoubleDivergences] = React.useState(filtersDefValue.hasDoubleDivergences);
    const [selectedServerHasProperOverlap, setSelectedServerHasProperOverlap] = React.useState(filtersDefValue.hasProperOverlap);
    const [selectedServerHasProperElongation, setSelectedServerHasProperElongation] = React.useState(filtersDefValue.hasProperElongation);
    const [selectedServerPackSize, setSelectedServerPackSize] = React.useState(filtersDefValue.packSize ?? "1000000");
    const [selectedServerPattern3Value, setSelectedServerPattern3Value] = React.useState(filtersDefValue.pattern3Value ?? "0");
    const [selectedServerIsEnteredPosition, setSelectedServerIsEnteredPosition] = React.useState(filtersDefValue.isEnteredPosition);
    const [selectedServerHasHighCommission, setSelectedServerHasHighCommission] = React.useState(filtersDefValue.hasHighCommission);
    const [selectedServerIsOutOfTradeActiveHours, setSelectedServerIsOutOfTradeActiveHours] = React.useState(filtersDefValue.isOutOfTradeActiveHours);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerRefCandlePattern, setSelectedServerRefCandlePattern] = React.useState(filtersDefValue.refCandlePattern);
    const [selectedServerRefCandleBodyRatio, setSelectedServerRefCandleBodyRatio] = React.useState(filtersDefValue.refCandleBodyRatio);
    const [selectedServerRefCandleShadowsDifference, setSelectedServerRefCandleShadowsDifference] = React.useState(filtersDefValue.refCandleShadowsDifference);
    const [selectedServerLowerTimeFrameDivergenceIn, setSelectedServerLowerTimeFrameDivergenceIn] = React.useState(filtersDefValue.lowerTimeFrameDivergenceIn);
    const [selectedServerIsPinBar, setSelectedServerIsPinBar] = React.useState(filtersDefValue.isPinBar);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [multiSortMetaPacks, setMultiSortMetaPacks] = React.useState([]);
    const [defaultSymbols, setDefaultSymbols] = React.useState();
    const [intervals, setIntervals] = useState(IntervalHelper.intervalsList());

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];
    const [allFiltersData, setAllFiltersData] = useState([])

    //DELETED FOR CLIENT VERSION
    // const refCandlePattern = [
    //     { label: 'Without pattern', value: 0 },
    //     { label: 'Pattern 1', value: 1 },
    //     { label: 'Pattern 2', value: 2 },
    //     { label: 'Pattern 3', value: 3 }
    // ];

    // const lowerTimeFrameDivergenceSelection = [
    //     { label: 'None', value: 1 },
    //     { label: 'One Phase', value: 2 },
    //     { label: 'Two Phases', value: 3 },
    //     { label: 'Both', value: 4 },
    //     { label: 'Any', value: 5 }
    // ];

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
    const onSelectStrategyChange = (e) => {
        setSelectedServerStrategies(e.value);
        if ((e.value && e.value.length === 0) || !e.value || e.value == null) {
            setDefualtFilterData();
        }
    }
    const onSelectBackTestChange = (e) => {
        setSelectedServerBacktests(e.value);
        if ((e.value && e.value.length === 0) || !e.value || e.value == null) {
            setDefualtFilterData();
        }
    }
    const onSelectStrategyHide = async (e) => {

        if (selectedServerStrategies && selectedServerStrategies.length > 0) {
            let filterData = await scalpServices.getStrategyData(selectedServerStrategies);
            setAllFiltersData(filterData);
            if (filterData && filterData.timeFrameSymbols && filterData.timeFrameSymbols !== undefined && filterData.timeFrameSymbols != null) {
                setIntervals(Object.keys(filterData.timeFrameSymbols).map(x => { return { label: x, value: x } }));

                let allSymbols = [];
                Object.values(filterData.timeFrameSymbols).forEach(element => {
                    allSymbols.push(...element)
                });
                allSymbols = [...new Set(allSymbols)];
                setSymbols(allSymbols.map(x => { return { label: x, value: x }; }))
            }
            if (filterData && filterData.startDate && filterData.startDate != null) {
                setSelectedServerTriggerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
            }
            if (filterData && filterData.endDate && filterData.endDate != null) {
                setSelectedServerTriggerEndDate(dateHelper.utcEpochSecondsToDate(filterData.endDate));
            }

        } else {
            setDefualtFilterData();
        }


    }
    const onSelectBackTestHide = async (e) => {
        if (selectedServerBacktests && selectedServerBacktests.length > 0) {
            let filterData = await scalpServices.getBackTestStrategyData(selectedServerBacktests);
            setAllFiltersData(filterData);
            if (filterData && filterData.timeFrameSymbols && filterData.timeFrameSymbols !== undefined && filterData.timeFrameSymbols != null) {

                setIntervals(Object.keys(filterData.timeFrameSymbols).map(x => { return { label: x, value: x } }));
                let allSymbols = [];
                Object.values(filterData.timeFrameSymbols).forEach(element => {
                    allSymbols.push(...element)
                });
                allSymbols = [...new Set(allSymbols)];
                setSymbols(allSymbols.map(x => { return { label: x, value: x }; }))
            }
            if (filterData && filterData.startDate && filterData.startDate != null) {
                setSelectedServerTriggerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
            }
            if (filterData && filterData.endDate && filterData.endDate != null) {
                setSelectedServerTriggerEndDate(dateHelper.utcEpochSecondsToDate(filterData.endDate));
            }
        } else {
            setDefualtFilterData();
        }

    }
    const onTimeFrameSelectChange = (e) => {
        setSelectedServerInterval(e.value);
        if (e.value && allFiltersData && allFiltersData.timeFrameSymbols && allFiltersData.timeFrameSymbols[e.value] && allFiltersData.timeFrameSymbols[e.value] != null) {

            setSymbols(allFiltersData.timeFrameSymbols[e.value].map(x => { return { label: x, value: x }; }));
        }

    }
    const setDefualtFilterData = () => {
        setIntervals(IntervalHelper.intervalsList());
        setSelectedServerTriggerStartDate(
            dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 90, filtersDefValue.startDate?.type ?? 'days').toDate()));
        setSelectedServerTriggerEndDate(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate()));
        setSymbols(defaultSymbols);
    }
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
        isMounted.current = true;
        visibilityDetector.attach('finance-management-container');
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
            setDefaultSymbols(data)
        });
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });
        scalpServices.getReasonsToNotEnter().then(data => {
            if (isLive) {
                data = data.filter(x => x.value != "backtest");
            }
            setReasonsToNotEnter(data);
        });
        if (isLive) {
            scalpServices.getStrategiesDropDown().then(data => {
                setStrategies(data);
            });
        }
        else {
            scalpServices.getBacktestsDropDown().then(data => {
                setBacktests(data);
            });
        }
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {

        setPositionsData(null);
        setLoading(true);
        setPacksLoading(true);
        let start = null;
        let end = null;
        let symbols = null;
        let reasonsToNotEnter = null;
        let strategies = null;
        let backtests = null;

        if (selectedServerTriggerStartDate) {
            const time = selectedServerTriggerStartTime.split(":");
            selectedServerTriggerStartDate.setHours(time[0])
            selectedServerTriggerStartDate.setMinutes(time[1])
            selectedServerTriggerStartDate.setSeconds(time[2])
            start = dateHelper.considerAsUTCUnix(selectedServerTriggerStartDate);
        }
        if (selectedServerTriggerEndDate) {
            const time = selectedServerTriggerEndTime.split(":");
            selectedServerTriggerEndDate.setHours(time[0])
            selectedServerTriggerEndDate.setMinutes(time[1])
            selectedServerTriggerEndDate.setSeconds(time[2])
            end = dateHelper.considerAsUTCUnix(selectedServerTriggerEndDate);
        }

        if (selectedServerSymbols && selectedServerSymbols.length > 0)
            symbols = selectedServerSymbols.join();
        if (!reasonsToNotEnter && selectedServerReasonsToNotEnter && selectedServerReasonsToNotEnter.length > 0)
            reasonsToNotEnter = selectedServerReasonsToNotEnter.join();

        if (selectedServerStrategies && selectedServerStrategies.length > 0)
            strategies = selectedServerStrategies.join();
        if (selectedServerBacktests && selectedServerBacktests.length > 0)
            backtests = selectedServerBacktests.join();

        scalpServices.getFinanceManagement(symbols, selectedServerInterval, selectedServerPackSize, start, end,
            selectedServerIsSucceed, selectedServerIsEnteredPosition, selectedServerIsRegisteredInMarket,
            strategies, backtests, selectedServerHasHighCommission, selectedServerIsOutOfTradeActiveHours,
            selectedServerIsExchangeData, selectedServerHasDoubleDivergences, selectedServerRefCandlePattern,
            selectedServerHasProperElongation, selectedServerHasProperOverlap, selectedServerPattern3Value,
            selectedServerIncludePositionsRecords, selectedServerRefCandleBodyRatio,
            selectedServerRefCandleShadowsDifference, selectedServerIsPinBar, reasonsToNotEnter,
            selectedServerLowerTimeFrameDivergenceIn, selectedServerGroupBySymbols, selectedServerRewardToRiskTolerance).then(data => {
                if (data?.result) {
                    setFinanceData(data.result);
                }
                setLoading(false);
                setPacksLoading(false);
            });
    }

    function symbolsCountBodyTemplate(rowData, raw) {
        if (rowData) {
            var value = rowData[raw.field];
            if (value != null && value !== "") {
                var symbols = value.split(',');
                return symbols.length;
            }
        }
        return '';
    }

    function packSelectorBodyTemplate(rowData) {
        return <Button icon="pi pi-eye" className="p-button-rounded p-button-text" onClick={() => loadPositions(rowData.positions)} />
    }

    function loadPositions(data) {
        setPositionsLoading(true);
        setPositionsData(data);
        setPositionsLoading(false);
    }

    //#region Filters
    const [filteredColumns, setFilteredColumns] = useState([]);
    const [datatableFilters, setDatatableFilters] = useState({});
    const [selectedStartDate, setSelectedStartDate] = useState([]);
    const [selectedEndDate, setSelectedEndDate] = useState([]);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = useState(null);
    const [selectedTextFilterType, setSelectedTextFilterType] = useState(null);
    const [selectedTextFilterValue, setSelectedTextFilterValue] = useState('');
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = useState(false);
    const [displayTextFilterDialog, setDisplayTextFilterDialog] = useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = useState(null);
    const [displayTextColumnFilter, setDisplayTextColumnFilter] = useState(null);
    const [numericColumnComparisonType, setNumericColumnComparisonType] = useState({
        packOrder: '',
        packSize: '',
        symbols: '',
        totalCount: '',
        winCount: '',
        lossCount: '',
        winRatio: '',
        winRiskRewardAvg: '',
        winRiskRewardSum: '',
        riskRewardSum: '',
        riskRewardPureSum: '',
        exchangeWinCount: '',
        exchangeLossCount: '',
        exchangeWinRatio: '',
        exchangeWinRiskRewardAvg: '',
        exchangeWinRiskRewardSum: '',
        exchangeRiskRewardSum: '',
        exchangeRiskRewardPureSum: '',
        exchangeCurrentWinAmount: '',
        exchangeCurrentLossAmount: '',
        exchangeProfit: '',
        exchangeCommission: '',
        exchangeCommissionR: '',
        positionsDurationAverage: '',
        currentWinAmount: '',
        currentLossAmount: '',
        currentProfit: '',
        realProfit: '',
        calculatedCommissionSum: '',
        commissionR: '',
        commissionSum: '',
        maxRewardToRiskSum: '',
        potentialRewardToRiskSum: '',
        stopTrailRewardToRiskSum: '',
        maxRewardToRiskWinsAvg: '',
        potentialRewardToRiskWinsAvg: '',
        stopTrailRewardToRiskWinsAvg: '',
    });

    const [textColumnComparisonType, setTextColumnComparisonType] = useState({
        packName: '',
        durationInDays: '',
        durationInHours: '',
    });

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

    const onStartDateChange = (e) => {
        pack.current.filter(e.value, 'startDate', 'custom');
        setSelectedStartDate(e.value);
    }
    const onEndDateChange = (e) => {
        pack.current.filter(e.value, 'endDate', 'custom');
        setSelectedEndDate(e.value);
    }

    //#region Start Numeric Filter
    const onNumericFilter = (type) => {
        var temp = { ...numericColumnComparisonType };
        temp[displayNumericColumnFilter] = selectedNumericFilterType;
        setNumericColumnComparisonType(temp);

        pack.current.filter(selectedNumericFilterValue, displayNumericColumnFilter, 'custom');
        setSelectedNumericFilterValue(null);
        setSelectedNumericFilterType(null);
        onNumericFilterHide(type);
    }

    const onNumericFilterClear = (name) => {
        var temp = { ...numericColumnComparisonType };
        temp[name] = '';
        setNumericColumnComparisonType(temp);
        pack.current.filter(null, name, 'custom');
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
    //#endregion

    //#region  Text Filter
    const onTextFilter = () => {
        var temp = { ...textColumnComparisonType };
        temp[displayTextColumnFilter] = selectedTextFilterType;
        setTextColumnComparisonType(temp);

        if (selectedTextFilterValue === null || selectedTextFilterValue === undefined || selectedTextFilterValue === '')
            pack.current.filter('***#undefined#***', displayTextColumnFilter, 'custom');
        else
            pack.current.filter(selectedTextFilterValue, displayTextColumnFilter, 'custom');
        setSelectedTextFilterValue('');
        setSelectedTextFilterType(null);
        onTextFilterHide();
    }

    const onTextFilterClear = (name) => {
        var temp = { ...textColumnComparisonType };
        temp[name] = '';
        setTextColumnComparisonType(temp);
        pack.current.filter(null, name, 'custom');
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
    //#endregion

    const reset = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setNumericColumnComparisonType({
            packOrder: '',
            packSize: '',
            symbols: '',
            totalCount: '',
            winCount: '',
            lossCount: '',
            winRatio: '',
            winRiskRewardAvg: '',
            winRiskRewardSum: '',
            riskRewardSum: '',
            riskRewardPureSum: '',
            exchangeWinCount: '',
            exchangeLossCount: '',
            exchangeWinRatio: '',
            exchangeWinRiskRewardAvg: '',
            exchangeWinRiskRewardSum: '',
            exchangeRiskRewardSum: '',
            exchangeRiskRewardPureSum: '',
            exchangeCurrentWinAmount: '',
            exchangeCurrentLossAmount: '',
            exchangeProfit: '',
            exchangeCommission: '',
            exchangeCommissionR: '',
            positionsDurationAverage: '',
            currentWinAmount: '',
            currentLossAmount: '',
            currentProfit: '',
            realProfit: '',
            calculatedCommissionSum: '',
            commissionR: '',
            commissionSum: '',
            maxRewardToRiskSum: '',
            potentialRewardToRiskSum: '',
            stopTrailRewardToRiskSum: '',
            maxRewardToRiskWinsAvg: '',
            potentialRewardToRiskWinsAvg: '',
            stopTrailRewardToRiskWinsAvg: '',
        });
        setTextColumnComparisonType({
            packName: '',
            durationInDays: '',
            durationInHours: '',
        });
        setFilteredColumns([]);
        setDatatableFilters([]);
        pack.current.reset();
    }

    const packOrderFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('packOrder', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('packOrder')} />
        </span>
    const packNameFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('packName')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('packName')} />
        </span>
    const packSizeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('packSize', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('packSize')} />
        </span>
    const symbolsFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('symbols', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('symbols')} />
        </span>
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
    const winRiskRewardAvgFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRiskRewardAvg', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRiskRewardAvg')} />
        </span>
    const winRiskRewardSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRiskRewardSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRiskRewardSum')} />
        </span>
    const riskRewardSumFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('riskRewardSum', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('riskRewardSum')} />
        </span>
    //DELETED FOR CLIENT VERSION
    // const riskRewardPureSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('riskRewardPureSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('riskRewardPureSum')} />
    //     </span>
    // const exchangeRiskRewardSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeRiskRewardSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeRiskRewardSum')} />
    //     </span>
    // const exchangeWinRiskRewardSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRiskRewardSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRiskRewardSum')} />
    //     </span>
    // const exchangeWinRiskRewardAvgFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRiskRewardAvg', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRiskRewardAvg')} />
    //     </span>
    // const exchangeWinRatioFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRatio', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRatio')} />
    //     </span>
    // const exchangeLossCountFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeLossCount', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeLossCount')} />
    //     </span>
    // const exchangeWinCountFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinCount', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinCount')} />
    //     </span>
    // const exchangeRiskRewardPureSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeRiskRewardPureSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeRiskRewardPureSum')} />
    //     </span>
    // const exchangeCurrentWinAmountFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCurrentWinAmount', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCurrentWinAmount')} />
    //     </span>
    // const exchangeCurrentLossAmountFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCurrentLossAmount', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCurrentLossAmount')} />
    //     </span>
    // const exchangeProfitFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeProfit', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeProfit')} />
    //     </span>
    // const exchangeCommissionFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCommission', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCommission')} />
    //     </span>
    // const exchangeCommissionRFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeCommissionR', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeCommissionR')} />
    //     </span>
    const durationInDaysFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('durationInDays')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('durationInDays')} />
        </span>
    const durationInHoursFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('durationInHours')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('durationInHours')} />
        </span>
    const positionsDurationAverageFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('positionsDurationAverage', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('positionsDurationAverage')} />
        </span>
    const currentWinAmountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('currentWinAmount', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('currentWinAmount')} />
        </span>
    const currentLossAmountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('currentLossAmount', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('currentLossAmount')} />
        </span>
    const currentProfitFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('currentProfit', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('currentProfit')} />
        </span>
    //DELETED FOR CLIENT VERSION
    // const realProfitFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('realProfit', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('realProfit')} />
    //     </span>
    // const calculatedCommissionSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedCommissionSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedCommissionSum')} />
    //     </span>
    // const commissionRFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('commissionR', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('commissionR')} />
    //     </span>
    // const commissionSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('commissionSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('commissionSum')} />
    //     </span>
    // const maxRewardToRiskSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('maxRewardToRiskSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('maxRewardToRiskSum')} />
    //     </span>
    // const potentialRewardToRiskSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('potentialRewardToRiskSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('potentialRewardToRiskSum')} />
    //     </span>
    // const stopTrailRewardToRiskSumFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('stopTrailRewardToRiskSum', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('stopTrailRewardToRiskSum')} />
    //     </span>
    // const maxRewardToRiskWinsAvgFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('maxRewardToRiskWinsAvg', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('maxRewardToRiskWinsAvg')} />
    //     </span>
    // const potentialRewardToRiskWinsAvgFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('potentialRewardToRiskWinsAvg', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('potentialRewardToRiskWinsAvg')} />
    //     </span>
    // const stopTrailRewardToRiskWinsAvgFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('stopTrailRewardToRiskWinsAvg', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('stopTrailRewardToRiskWinsAvg')} />
    //     </span>
    const startDateFilter = <Calendar value={selectedStartDate} dateFormat="dd/mm/yy" selectionMode="range" showIcon showButtonBar onChange={onStartDateChange} showTime showSeconds />
    const endDateFilter = <Calendar value={selectedEndDate} dateFormat="dd/mm/yy" selectionMode="range" showIcon showButtonBar onChange={onEndDateChange} showTime showSeconds />

    const onCustomFilter = (ev) => {
        setFilteredColumns(Object.keys(ev.filters));
        setDatatableFilters(ev.filters);
    }
    //#endregion

    const packColumns = [
        {
            ...columnHelper.defaultColumn,
            body: packSelectorBodyTemplate,
            columnKey: "showPos",
            style: { 'minWidth': '50px', width: '50px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "packOrder",
            header: "Order",
            sortable: true,
            filter: true,
            filterElement: packOrderFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.packOrder),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "packName",
            header: "Name",
            sortable: true,
            filter: true,
            filterElement: packNameFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.packName),
            style: { 'minWidth': '100px', width: '150px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "packSize",
        //     header: "Size",
        //     sortable: true,
        //     filter: true,
        //     filterElement: packSizeFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.packSize),
        //     style: { 'minWidth': '50px', width: '80px' }
        // },
        {
            ...columnHelper.defaultColumn,
            field: "symbols",
            header: "Symbols Count",
            sortable: true,
            filter: true,
            filterElement: symbolsFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.symbols),
            body: symbolsCountBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "totalCount",
            header: "Total Count",
            sortable: true,
            filter: true,
            filterElement: totalCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.totalCount),
            body: templates.digitBodyTemplate,
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
            body: templates.digitBodyTemplate,
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
            body: templates.digitBodyTemplate,
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
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRiskRewardAvg",
            header: "Wins R/R Avg",
            sortable: true,
            filter: true,
            filterElement: winRiskRewardAvgFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRiskRewardAvg),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRiskRewardSum",
            header: "Wins R/R Sum",
            sortable: true,
            filter: true,
            filterElement: winRiskRewardSumFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRiskRewardSum),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "riskRewardSum",
            header: "R/R Sum",
            sortable: true,
            filter: true,
            filterElement: riskRewardSumFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.riskRewardSum),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "riskRewardPureSum",
        //     header: "R/R Pure",
        //     sortable: true,
        //     filter: true,
        //     filterElement: riskRewardPureSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.riskRewardPureSum),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinCount",
        //     header: "Exchange Win Count",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeWinCountFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinCount),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeLossCount",
        //     header: "Exchange Loss Count",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeLossCountFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeLossCount),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRatio",
        //     header: "Exchange Win Ratio",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeWinRatioFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRatio),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRiskRewardAvg",
        //     header: "Exchange Wins R/R Avg",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeWinRiskRewardAvgFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRiskRewardAvg),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRiskRewardSum",
        //     header: "Exchange Wins R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeWinRiskRewardSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRiskRewardSum),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeRiskRewardSum",
        //     header: "Exchange R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeRiskRewardSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeRiskRewardSum),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeRiskRewardPureSum",
        //     header: "Exchange R/R Pure",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeRiskRewardPureSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeRiskRewardPureSum),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCurrentWinAmount",
        //     header: "Exchange Current Win Amount",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeCurrentWinAmountFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCurrentWinAmount),
        //     body: templates.digitDollarBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCurrentLossAmount",
        //     header: "Exchange Current Loss Amount",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeCurrentLossAmountFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCurrentLossAmount),
        //     body: templates.digitDollarBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeProfit",
        //     header: "Exchange Profit",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeProfitFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeProfit),
        //     body: templates.digitDollarBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCommission",
        //     header: "Exchange Commission",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeCommissionFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCommission),
        //     body: templates.digitDollarBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCommissionR",
        //     header: "Exchange Commission(R)",
        //     sortable: true,
        //     filter: true,
        //     filterElement: exchangeCommissionRFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeCommissionR),
        //     body: templates.digitBodyTemplate,
        //     headerClassName: "exchange-col",
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '150px' }
        // },
        {
            ...columnHelper.defaultColumn,
            field: "durationInDays",
            header: "Duration In Days",
            sortable: true,
            filter: true,
            filterElement: durationInDaysFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.durationInDays),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "durationInHours",
            header: "Duration In Hours",
            sortable: true,
            filter: true,
            filterElement: durationInHoursFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.durationInHours),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "positionsDurationAverage",
            header: "Positions Duration Average",
            sortable: true,
            filter: true,
            filterElement: positionsDurationAverageFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.positionsDurationAverage),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "currentWinAmount",
            header: "Estimated Win Amount With Commission",
            sortable: true,
            filter: true,
            filterElement: currentWinAmountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.currentWinAmount),
            body: templates.digitDollarBodyTemplate,
            style: { 'minWidth': '50px', width: '100px', display: isLive ? "block" : "none" }
        },
        {
            ...columnHelper.defaultColumn,
            field: "currentLossAmount",
            header: "Estimated Loss Amount With Commission",
            sortable: true,
            filter: true,
            filterElement: currentLossAmountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.currentLossAmount),
            body: templates.digitDollarBodyTemplate,
            style: { 'minWidth': '50px', width: '100px', display: isLive ? "block" : "none" }
        },
        {
            ...columnHelper.defaultColumn,
            field: "currentProfit",
            header: "Estimated Profit With Commission",
            sortable: true,
            filter: true,
            filterElement: currentProfitFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.currentProfit),
            body: templates.digitDollarBodyTemplate,
            style: { 'minWidth': '50px', width: '100px', display: isLive ? "block" : "none" }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "realProfit",
        //     header: "Real Profit",
        //     sortable: true,
        //     filter: true,
        //     filterElement: realProfitFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.realProfit),
        //     body: templates.digitDollarBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "calculatedCommissionSum",
        //     header: "Calculated Commission Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: calculatedCommissionSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedCommissionSum),
        //     body: templates.digitDollarBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "commissionR",
        //     header: "Calculated Commission Sum(R)",
        //     sortable: true,
        //     filter: true,
        //     filterElement: commissionRFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.commissionR),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "commissionSum",
        //     header: "Commission Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: commissionSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.commissionSum),
        //     body: templates.digitDollarBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "maxRewardToRiskSum",
        //     header: "Max R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: maxRewardToRiskSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.maxRewardToRiskSum),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "potentialRewardToRiskSum",
        //     header: "Potential R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: potentialRewardToRiskSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.potentialRewardToRiskSum),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "stopTrailRewardToRiskSum",
        //     header: "Stop Trail R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: stopTrailRewardToRiskSumFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.stopTrailRewardToRiskSum),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "maxRewardToRiskWinsAvg",
        //     header: "Max R/R Avg",
        //     sortable: true,
        //     filter: true,
        //     filterElement: maxRewardToRiskWinsAvgFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.maxRewardToRiskWinsAvg),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "potentialRewardToRiskWinsAvg",
        //     header: "Potential R/R Avg",
        //     sortable: true,
        //     filter: true,
        //     filterElement: potentialRewardToRiskWinsAvgFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.potentialRewardToRiskWinsAvg),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "stopTrailRewardToRiskWinsAvg",
        //     header: "Stop Trail R/R Avg",
        //     sortable: true,
        //     filter: true,
        //     filterElement: stopTrailRewardToRiskWinsAvgFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.stopTrailRewardToRiskWinsAvg),
        //     body: templates.digitBodyTemplate,
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        {
            ...columnHelper.defaultColumn,
            field: "startDate",
            header: "Start Date",
            sortable: true,
            filter: true,
            filterElement: startDateFilter,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '150px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "endDate",
            header: "End Date",
            sortable: true,
            filter: true,
            filterElement: endDateFilter,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '150px' }
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
            name: "timeFrame",
            label: "Time Frame",
            type: FilterType.DropDown,
            options: intervals,
            state: selectedServerInterval,
            setState: setSelectedServerInterval
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
            name: "isSucceed",
            label: "Is Succeed (Target Hitted)?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsSucceed,
            setState: setSelectedServerIsSucceed
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "packSize",
        //     label: "Pack Size",
        //     type: FilterType.Number,
        //     state: selectedServerPackSize,
        //     setState: setSelectedServerPackSize
        // },
        // {
        //     name: "isEnteredPosition",
        //     label: "Has Enough Money To Enter Position?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsEnteredPosition,
        //     setState: setSelectedServerIsEnteredPosition
        // },
        // {
        //     name: "hasHighCommission",
        //     label: "Has High Commission?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerHasHighCommission,
        //     setState: setSelectedServerHasHighCommission
        // },
        (isLive === true) && {
            name: "isRegisteredInMarket",
            label: "Is Registered In Market?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsRegisteredInMarket,
            setState: setSelectedServerIsRegisteredInMarket
        },
        {
            name: "startDate",
            label: "From Date",
            type: FilterType.Date,
            state: selectedServerTriggerStartDate,
            setState: setSelectedServerTriggerStartDate
        },
        {
            name: "startTime",
            label: "From Time",
            type: FilterType.Time,
            state: selectedServerTriggerStartTime,
            setState: setSelectedServerTriggerStartTime
        },
        {
            name: "endDate",
            label: "To Date",
            type: FilterType.Date,
            state: selectedServerTriggerEndDate,
            setState: setSelectedServerTriggerEndDate
        },
        {
            name: "endTime",
            label: "To Time",
            type: FilterType.Time,
            state: selectedServerTriggerEndTime,
            setState: setSelectedServerTriggerEndTime
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "isOutOfTradeActiveHours",
        //     label: "Is Out Of Trade Active Hours?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsOutOfTradeActiveHours,
        //     setState: setSelectedServerIsOutOfTradeActiveHours
        // },
        // {
        //     name: "isExchangeData",
        //     label: "Is Exchange Data?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsExchangeData,
        //     setState: setSelectedServerIsExchangeData
        // },
        // {
        //     name: "lowerTimeFrameDivergenceIn",
        //     label: "Lower Time Frame Divergence In",
        //     type: FilterType.DropDown,
        //     options: lowerTimeFrameDivergenceSelection,
        //     state: selectedServerLowerTimeFrameDivergenceIn,
        //     setState: setSelectedServerLowerTimeFrameDivergenceIn
        // },
        // {
        //     name: "refCandlePattern",
        //     label: "Ref Candle Pattern",
        //     type: FilterType.DropDown,
        //     options: refCandlePattern,
        //     state: selectedServerRefCandlePattern,
        //     setState: setSelectedServerRefCandlePattern
        // },
        {
            name: "reasonsToNotEnter",
            label: "Reasons To Not Enter",
            type: FilterType.MultiSelect,
            options: reasonsToNotEnter,
            state: selectedServerReasonsToNotEnter,
            setState: setSelectedServerReasonsToNotEnter
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "hasDoubleDivergences",
        //     label: "Has Double Divergences?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerHasDoubleDivergences,
        //     setState: setSelectedServerHasDoubleDivergences
        // },
        // {
        //     name: "HasProperOverlap",
        //     label: "Has Divergence with ending pattern (power)?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerHasProperOverlap,
        //     setState: setSelectedServerHasProperOverlap
        // },
        // {
        //     name: "HasDoubleDivergences",
        //     label: "Has Divergence with proper Elongation?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerHasProperElongation,
        //     setState: setSelectedServerHasProperElongation
        // },
        // {
        //     name: "pattern3Value",
        //     label: "Pattern 3 Value",
        //     type: FilterType.Number,
        //     state: selectedServerPattern3Value,
        //     setState: setSelectedServerPattern3Value
        // },
        // {
        //     name: "refCandleBodyRatio",
        //     label: "Max RefCandle Body Ratio",
        //     type: FilterType.Decimal,
        //     state: selectedServerRefCandleBodyRatio,
        //     setState: setSelectedServerRefCandleBodyRatio
        // },
        // {
        //     name: "refCandleShadowsDifference",
        //     label: "Max RefCandle Shadows Difference",
        //     type: FilterType.Decimal,
        //     state: selectedServerRefCandleShadowsDifference,
        //     setState: setSelectedServerRefCandleShadowsDifference
        // },
        // {
        //     name: "isPinBar",
        //     label: "Has Pin Bar Pattern?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsPinBar,
        //     setState: setSelectedServerIsPinBar
        // },
        (!isLive) && {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "includePositionsRecords",
            label: "Include Positions Records",
            type: FilterType.Switch,
            state: selectedServerIncludePositionsRecords,
            setState: setSelectedServerIncludePositionsRecords
        },
        {
            name: "groupBySymbols",
            label: "Group By Symbols",
            type: FilterType.Switch,
            state: selectedServerGroupBySymbols,
            setState: setSelectedServerGroupBySymbols
        }
    ]

    const packHeader = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(financeData.packs, "packs")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                </span>
            </div>
            <ColumnManager columns={packColumns} dataTableName="dt-state-finance-management" setSortState={setMultiSortMetaPacks}
                onSave={() => setFinanceData(prevState => ({ ...prevState }))} />
        </div>
    );
    var positionType = isLive === true
        ? "live"
        : isLive === false
            ? "backtest"
            : null;
    return (
        <div id="finance-management-container">
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
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <Fieldset legend="Server Filters" toggleable>
                <div className="grid p-fluid">
                    {isLive &&
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverStrategy" className="align-self-baseline">Strategy</label>
                            <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                                onChange={onSelectStrategyChange}
                                placeholder="Select Versions" className="w-full align-self-end"
                                onHide={onSelectStrategyHide}
                            />
                        </div>}
                    {!isLive &&
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverBacktests" className="align-self-baseline">Backtests</label>
                            <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                                onChange={onSelectBackTestChange} placeholder="Select Versions" className="w-full align-self-end"
                                onHide={onSelectBackTestHide}
                            />
                        </div>}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                            onChange={onTimeFrameSelectChange} placeholder="Select a Time Frame" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverSymbols" className="align-self-baseline">Symbols</label>
                        <div className="w-full flex align-self-end">
                            <MultiSelect id='serverSymbols' value={selectedServerSymbols} options={symbols} filter showClear style={{ width: '90%' }}
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="align-self-end" />
                        </div>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPackSize" className="align-self-baseline">Pack Size</label>
                        <InputNumber inputId="serverPackSize" value={selectedServerPackSize}
                            onChange={(e) => setSelectedServerPackSize(e.value)} className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsSucceed" className="align-self-baseline">Is Succeed (Target Hitted)?</label>
                        <Dropdown id='serverIsSucceed' value={selectedServerIsSucceed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsSucceed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsEnteredPosition" className="align-self-baseline">Has Enough Money To Enter Position?</label>
                        <Dropdown id='serverIsEnteredPosition' value={selectedServerIsEnteredPosition} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsEnteredPosition(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    {isLive && <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    {!isLive && <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber inputId="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance}
                            onChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)} className="w-full align-self-end"
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} />
                    </div>}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverLowerTimeFrameDivergenceIn" className="align-self-baseline">Lower Time Frame Divergence In</label>
                        <Dropdown id='serverLowerTimeFrameDivergenceIn' value={selectedServerLowerTimeFrameDivergenceIn} options={lowerTimeFrameDivergenceSelection} showClear
                            onChange={(e) => setSelectedServerLowerTimeFrameDivergenceIn(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverTriggerStartDate" className="align-self-baseline">From Date</label>
                        <Calendar id="serverTriggerStartDate" value={selectedServerTriggerStartDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                            onChange={(e) => setSelectedServerTriggerStartDate(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverTriggerStartTime" className="align-self-baseline">From Time</label>
                        <InputMask mask="99:99:99" value={selectedServerTriggerStartTime}
                            onChange={(e) => setSelectedServerTriggerStartTime(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverTriggerEndDate" className="align-self-baseline">To Date</label>
                        <Calendar id="serverTriggerEndDate" value={selectedServerTriggerEndDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                            onChange={(e) => setSelectedServerTriggerEndDate(e.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverTriggerEndTime" className="align-self-baseline">To Time</label>
                        <InputMask mask="99:99:99" value={selectedServerTriggerEndTime}
                            onChange={(e) => setSelectedServerTriggerEndTime(e.value)} className="w-full align-self-end" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverHasHighCommission" className="align-self-baseline">Has High Commission?</label>
                        <Dropdown id='serverHasHighCommission' value={selectedServerHasHighCommission} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerHasHighCommission(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsOutOfTradeActiveHours" className="align-self-baseline">Is Out Of Trade Active Hours?</label>
                        <Dropdown id='serverIsOutOfTradeActiveHours' value={selectedServerIsOutOfTradeActiveHours} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsOutOfTradeActiveHours(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsExchangeData" className="align-self-baseline">Is Exchange Data?</label>
                        <Dropdown id='serverIsExchangeData' value={selectedServerIsExchangeData} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsExchangeData(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverHasDoubleDivergences" className="align-self-baseline">Has Double Divergences?</label>
                        <Dropdown id='serverHasDoubleDivergences' value={selectedServerHasDoubleDivergences} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerHasDoubleDivergences(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverHasProperOverlap" className="align-self-baseline">Has Divergence with ending pattern (power)?</label>
                        <Dropdown id='serverHasProperOverlap' value={selectedServerHasProperOverlap} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerHasProperOverlap(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverHasProperElongation" className="align-self-baseline">Has Divergence with proper Elongation?</label>
                        <Dropdown id='serverHasProperElongation' value={selectedServerHasProperElongation} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerHasProperElongation(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRefCandlePattern" className="align-self-baseline">Ref Candle Pattern</label>
                        <Dropdown id='serverRefCandlePattern' value={selectedServerRefCandlePattern} options={refCandlePattern} filter showClear
                            onChange={(e) => setSelectedServerRefCandlePattern(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsPinBar" className="align-self-baseline">Has Pin Bar Pattern?</label>
                        <Dropdown id='serverIsPinBar' value={selectedServerIsPinBar} options={booleanSelection} showClear
                            onChange={(e) => setSelectedServerIsPinBar(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRefCandleBodyRatio" className="align-self-baseline">Max RefCandle Body Ratio</label>
                        <InputNumber id="serverRefCandleBodyRatio" value={selectedServerRefCandleBodyRatio} onValueChange={(e) => setSelectedServerRefCandleBodyRatio(e.value)}
                            showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRefCandleShadowsDifference" className="align-self-baseline">Max RefCandle Shadows Difference</label>
                        <InputNumber id="serverRefCandleShadowsDifference" value={selectedServerRefCandleShadowsDifference} onValueChange={(e) => setSelectedServerRefCandleShadowsDifference(e.value)}
                            showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPattern3Value" className="align-self-baseline">Pattern 3 Value</label>
                        <InputNumber inputId="serverPattern3Value" value={selectedServerPattern3Value}
                            onChange={(e) => setSelectedServerPattern3Value(e.value)} className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap align-content-center">
                        <InputSwitch inputId="serverIncludePositionsRecords" checked={selectedServerIncludePositionsRecords} onChange={(e) => setSelectedServerIncludePositionsRecords(e.value)} />
                        <label htmlFor="serverIncludePositionsRecords" className="align-self-center ml-2">Include Positions Records</label>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap align-content-center">
                        <InputSwitch inputId="serverGroupBySymbols" checked={selectedServerGroupBySymbols} onChange={(e) => setSelectedServerGroupBySymbols(e.value)} />
                        <label htmlFor="serverGroupBySymbols" className="align-self-center ml-2">Group By Symbols</label>
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto"
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} loading={loading} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-finance-management"
                            onSave={loadData} />
                    </div>
                </div>
            </Fieldset>
            <Fieldset legend="Total Report" className="mt-3" toggleable>
                <div className="grid p-fluid">
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <Divider align="left" type="dashed"><b>Market</b></Divider>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Initial Fund" value={financeData.initialFund} prefix="$" />
                    </div>
                    <div className="col-0 md:col-6 lg:col-9"></div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Wins Sum" value={financeData.exchangeWinsAmountSum} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Losses Sum" value={financeData.exchangeLossesAmountSum} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Total Pnl" value={financeData.exchangeTotalPnl} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Commission" value={financeData.exchangeCommission} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Profit" value={financeData.exchangeProfit} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Win Ratio" value={financeData.exchangeWinRatio} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange R/R Sum" value={financeData.exchangeRiskRewardSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Commission(R)" value={financeData.exchangeCommissionR} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange R/R Pure" value={financeData.exchangeRiskRewardPureSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Exchange Wins R/R Avg" value={financeData.exchangeWinsRiskRewardAvg} />
                    </div> */}

                    <Divider align="left" type="dashed"><b>Bot</b></Divider>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Balance" value={financeData.currentFund} prefix="$" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Wins Sum" value={financeData.winsAmountSum} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Losses Sum" value={financeData.lossesAmountSum} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Commission" value={financeData.calculatedCommissionSum} prefix="$" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Profit" value={financeData.profit} prefix="$" />
                    </div> */}
                    {isLive && <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Estimated Profit with commision" value={financeData.totalPnl} prefix="$" />
                    </div>}

                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Win Ratio" value={financeData.positionsWinRatio} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot R/R Sum" value={financeData.riskRewardSum} />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Commission(R)" value={financeData.commissionSumR} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot R/R Pure" value={financeData.riskRewardPureSum} />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Wins R/R Avg" value={financeData.positionWinsRiskRewardAvg} />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-3 lg:col-3"></div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Max R/R Sum" value={financeData.maxRewardToRiskSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Potential R/R Sum" value={financeData.potentialRewardToRiskSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Bot Stop Trail R/R Sum" value={financeData.stopTrailRewardToRiskSum} />
                    </div> */}

                    <hr className="col-12 md:col-12 lg:col-12" />

                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Total Packs Count" value={financeData.totalPacksCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={financeData.totalPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-6"></div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={financeData.startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={financeData.endDate} />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Duration In Days" value={financeData.durationInDays} />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3">
                        <LabelWithValue className="p-inputgroup" displayText="Duration" value={financeData.duration} />
                    </div>
                </div>
            </Fieldset>
            <Card className="mt-2">
                {/* //DELETED FOR CLIENT VERSION */}
                {/* <h4>Packs</h4> */}
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable value={financeData.packs} ref={pack} scrollable className="p-datatable-sm mt-2" showGridlines filterDisplay="row" scrollDirection="both"
                    dataKey="packName" header={packHeader}
                    paginator paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    multiSortMeta={multiSortMetaPacks} onSort={(e) => setMultiSortMetaPacks(e.multiSortMeta)}
                    loading={packsLoading} contextMenuSelection={selectedContent} sortMode="multiple"
                    onContextMenuSelectionChange={e => setSelectedContent(e)} filters={datatableFilters} onFilter={onCustomFilter}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(packColumns, "dt-state-finance-management", filteredColumns)}

                </DataTable>
            </Card>
            <PositionTable positions={positionsData} positionType={positionType} setPositions={setPositionsData} loading={positionsLoading}
                tableStateName={"dt-state-pack-positions"} dataTableName="dt-state-pack-positions" />
        </div>
    );
}

FinanceManagementComponent.prototype = {
    isLive: PropTypes.bool,
}

