import React from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { InputMask } from 'primereact/inputmask';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { templates } from '../../utils/Templates';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { columnHelper } from '../../utils/ColumnHelper';
import Paginator from '../../components/Paginator';
import Export from '../Export';
import LabelWithValue from '../LabelWithValue';
import { exchangeServices } from '../../services/ExchangeServices';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import '../../assets/scss/HistogramWinningRatioReport.scss'
import FiltersStatement from '../FiltersStatement';
import PositionTable from '../PositionTable';
import { InputSwitch } from 'primereact/inputswitch';
import { IntervalHelper } from '../../utils/IntervalHelper';
import tooltipImage from '../../assets/images/GoldenDivergence.png';
import { Tooltip as ReactTooltip, TooltipWrapper } from 'react-tooltip';
import { Image } from 'primereact/image';

//REPORT 4 (Statistical)
const HistogramWinningRatioReport = () => {
    const state = window.localStorage.getItem("server-filters-histogram-winning-ratio");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const pg = React.useRef(null);
    const dt = React.useRef(null);
    const cm = React.useRef(null);
    const [data, setData] = React.useState([]);
    const [positionsData, setPositionsData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [first, setFirst] = React.useState(0);
    const [rows, setRows] = React.useState(10);
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerMinWinRatio, setSelectedServerMinWinRatio] = React.useState(filtersDefValue.minWinRatio);
    const [selectedServerHistogramNumber, setSelectedServerHistogramNumber] = React.useState(filtersDefValue.histogramNumber);
    const [selectedServerMinTotalCount, setSelectedServerMinTotalCount] = React.useState(filtersDefValue.minTotalCount);
    const [selectedServerIncludePositionsRecords, setSelectedServerIncludePositionsRecords] = React.useState(filtersDefValue.includePositionsRecords ?? false);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [totalPositionsCount, setTotalPositionsCount] = React.useState(0);
    const [currentPositionsCount, setCurrentPositionsCount] = React.useState(0);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [duration, setDuration] = React.useState('');
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = React.useState(null);
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = React.useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = React.useState(false);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = React.useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = React.useState(null);
    const [numericColumnComparisonType, setNumericColumnComparisonType] = React.useState({
        pureRewardToRiskSumBasedOnLiveMacd: '',
        winRatioBasedOnLiveMacd: '',
        lossCountBasedOnLiveMacd: '',
        winCountBasedOnLiveMacd: '',
        totalCountBasedOnLiveMacd: '',
        exchangePureRewardToRiskSumBasedOnLiveMacd: '',
        exchangeWinRatioBasedOnLiveMacd: '',
        exchangeLossCountBasedOnLiveMacd: '',
        exchangeWinCountBasedOnLiveMacd: '',
        exchangeTotalCountBasedOnLiveMacd: '',
        pureRewardToRiskSumBasedOnRefCandle: '',
        winRatioBasedOnRefCandle: '',
        lossCountBasedOnRefCandle: '',
        winCountBasedOnRefCandle: '',
        totalCountBasedOnRefCandle: '',
        exchangePureRewardToRiskSumBasedOnRefCandle: '',
        exchangeWinRatioBasedOnRefCandle: '',
        exchangeLossCountBasedOnRefCandle: '',
        exchangeWinCountBasedOnRefCandle: '',
        exchangeTotalCountBasedOnRefCandle: '',
        pureRewardToRiskSumBasedOnLivePrice: '',
        winRatioBasedOnLivePrice: '',
        lossCountBasedOnLivePrice: '',
        winCountBasedOnLivePrice: '',
        totalCountBasedOnLivePrice: '',
        exchangePureRewardToRiskSumBasedOnLivePrice: '',
        exchangeWinRatioBasedOnLivePrice: '',
        exchangeLossCountBasedOnLivePrice: '',
        exchangeWinCountBasedOnLivePrice: '',
        exchangeTotalCountBasedOnLivePrice: '',
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
    const [allFiltersData, setAllFiltersData] = React.useState([])
    const [defaultSymbols, setDefaultSymbols] = React.useState();
    const [intervals, setIntervals] = React.useState(IntervalHelper.intervalsList());
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
                setSelectedServerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
            }
            if (filterData && filterData.endDate && filterData.endDate != null) {
                setSelectedServerEndDate(dateHelper.utcEpochSecondsToDate(filterData.endDate));
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
                setSelectedServerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
            }
            if (filterData && filterData.endDate && filterData.endDate != null) {
                setSelectedServerEndDate(dateHelper.utcEpochSecondsToDate(filterData.endDate));
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
        setSelectedServerStartDate(
            dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 90, filtersDefValue.startDate?.type ?? 'days').toDate()));
            setSelectedServerEndDate(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate()));
        setSymbols(defaultSymbols);
    }

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
        if (selectedServerRewardToRiskTolerance) {
            filtersStatement.push({
                name: "R/R Tolerance: ",
                description: `Calculate r/r sum with telorance <strong>${selectedServerRewardToRiskTolerance}</strong>`
            })
        }
        if (selectedServerMinTotalCount) {
            filtersStatement.push({
                name: "Min Total Count: ",
                description: `Records filtered based on min total count <strong>${selectedServerMinTotalCount}</strong>`
            })
        }
        if (selectedServerMinWinRatio) {
            filtersStatement.push({
                name: "Min Win Ratio: ",
                description: `Records filtered based on min win ratio <strong>${selectedServerMinWinRatio}</strong>`
            })
        }
        if (selectedServerHistogramNumber) {
            filtersStatement.push({
                name: "Histogram Number: ",
                description: `Records filtered based on these histogram numbers: <strong>${selectedServerHistogramNumber}</strong>`
            })
        }
        //DELETED FOR CLIENT VERSION
        // filtersStatement.push({
        //     name: "Is Exchange Data?: ",
        //     description: (selectedServerIsExchangeData === 'true'
        //         ? `Get bot's wins or losses positions that registered in Exchange and synced with Exchange's positions'`
        //         : `Get bot's wins or losses positions that didn't register in Exchange or didn't sync with Exchange's positions`)
        // })
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter, selectedServerRewardToRiskTolerance
        , selectedServerMinTotalCount, selectedServerMinWinRatio, selectedServerHistogramNumber]);

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
            setDefaultSymbols(data);
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

        scalpServices.getLossesAndWinsBasedOnHistogramReport(strategies, backtests, symbols, selectedServerInterval, start, end
            , selectedServerIsRegisteredInMarket, selectedServerIsExchangeData
            , selectedServerReasonsToNotEnter, selectedServerIncludePositionsRecords, selectedServerRewardToRiskTolerance
            , selectedServerMinTotalCount, selectedServerMinWinRatio, selectedServerHistogramNumber).then(data => {
                setRows(data.lossesAndWinsBasedOnHistogram?.length ?? 10)
                setData(data.lossesAndWinsBasedOnHistogram);
                setTotalPositionsCount(data.totalPositionsCount);
                setCurrentPositionsCount(data.currentPositionsCount);
                setPositionsData(data.positions);
                setStartDate(data.startDate);
                setEndDate(data.endDate);
                setDuration(data.duration);
                setLoading(false);
            });
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

    // const onNumericFilterClear = (name) => {
    //     var temp = { ...numericColumnComparisonType };
    //     temp[name] = '';
    //     setNumericColumnComparisonType(temp);
    // }

    // const onNumericFilterOpen = (name, type) => {
    //     setDisplayNumericColumnFilter(name);
    //     if (type === 'decimal') {
    //         setDisplayNumericFilterDialogForDecimal(true);
    //     }
    //     else if (type === 'integer') {
    //         setDisplayNumericFilterDialogForInteger(true);
    //     }
    // }

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
        setNumericColumnComparisonType({
            pureRewardToRiskSumBasedOnLiveMacd: '',
            winRatioBasedOnLiveMacd: '',
            lossCountBasedOnLiveMacd: '',
            winCountBasedOnLiveMacd: '',
            totalCountBasedOnLiveMacd: '',
            exchangePureRewardToRiskSumBasedOnLiveMacd: '',
            exchangeWinRatioBasedOnLiveMacd: '',
            exchangeLossCountBasedOnLiveMacd: '',
            exchangeWinCountBasedOnLiveMacd: '',
            exchangeTotalCountBasedOnLiveMacd: '',
            pureRewardToRiskSumBasedOnRefCandle: '',
            winRatioBasedOnRefCandle: '',
            lossCountBasedOnRefCandle: '',
            winCountBasedOnRefCandle: '',
            totalCountBasedOnRefCandle: '',
            exchangePureRewardToRiskSumBasedOnRefCandle: '',
            exchangeWinRatioBasedOnRefCandle: '',
            exchangeLossCountBasedOnRefCandle: '',
            exchangeWinCountBasedOnRefCandle: '',
            exchangeTotalCountBasedOnRefCandle: '',
            pureRewardToRiskSumBasedOnLivePrice: '',
            winRatioBasedOnLivePrice: '',
            lossCountBasedOnLivePrice: '',
            winCountBasedOnLivePrice: '',
            totalCountBasedOnLivePrice: '',
            exchangePureRewardToRiskSumBasedOnLivePrice: '',
            exchangeWinRatioBasedOnLivePrice: '',
            exchangeLossCountBasedOnLivePrice: '',
            exchangeWinCountBasedOnLivePrice: '',
            exchangeTotalCountBasedOnLivePrice: '',
        });
        setGlobalFilter('');
        dt.current.reset();
    }

    //DELETED FOR CLIENT VERSION
    // const totalCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('totalCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('totalCountBasedOnLivePrice')} />
    //     </span>
    // const winCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winCountBasedOnLivePrice')} />
    //     </span>
    // const lossCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('lossCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('lossCountBasedOnLivePrice')} />
    //     </span>
    // const winRatioBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatioBasedOnLivePrice', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatioBasedOnLivePrice')} />
    //     </span>
    // const pureRewardToRiskSumBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnLivePrice', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnLivePrice')} />
    //     </span>
    // const pureRewardToRiskSumBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnLivePrice', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnLivePrice')} />
    //     </span>
    // const exchangeTotalCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeTotalCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeTotalCountBasedOnLivePrice')} />
    //     </span>
    // const exchangeWinCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinCountBasedOnLivePrice')} />
    //     </span>
    // const exchangeLossCountBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeLossCountBasedOnLivePrice', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeLossCountBasedOnLivePrice')} />
    //     </span>
    // const exchangeWinRatioBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRatioBasedOnLivePrice', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRatioBasedOnLivePrice')} />
    //     </span>
    // const exchangePureRewardToRiskSumBasedOnLivePriceFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangePureRewardToRiskSumBasedOnLivePrice', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangePureRewardToRiskSumBasedOnLivePrice')} />
    //     </span>

    // const totalCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('totalCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('totalCountBasedOnRefCandle')} />
    //     </span>
    // const winCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winCountBasedOnRefCandle')} />
    //     </span>
    // const lossCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('lossCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('lossCountBasedOnRefCandle')} />
    //     </span>
    // const winRatioBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatioBasedOnRefCandle', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatioBasedOnRefCandle')} />
    //     </span>
    // const pureRewardToRiskSumBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnRefCandle', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnRefCandle')} />
    //     </span>
    //DELETED FOR CLIENT VERSION
    // const pureRewardToRiskSumBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnRefCandle', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnRefCandle')} />
    //     </span>
    // const exchangeTotalCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeTotalCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeTotalCountBasedOnRefCandle')} />
    //     </span>
    // const exchangeWinCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinCountBasedOnRefCandle')} />
    //     </span>
    // const exchangeLossCountBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeLossCountBasedOnRefCandle', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeLossCountBasedOnRefCandle')} />
    //     </span>
    // const exchangeWinRatioBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRatioBasedOnRefCandle', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRatioBasedOnRefCandle')} />
    //     </span>
    // const exchangePureRewardToRiskSumBasedOnRefCandleFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangePureRewardToRiskSumBasedOnRefCandle', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangePureRewardToRiskSumBasedOnRefCandle')} />
    //     </span>

    // const totalCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('totalCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('totalCountBasedOnLiveMacd')} />
    //     </span>
    // const winCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winCountBasedOnLiveMacd')} />
    //     </span>
    // const lossCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('lossCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('lossCountBasedOnLiveMacd')} />
    //     </span>
    // const winRatioBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatioBasedOnLiveMacd', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatioBasedOnLiveMacd')} />
    //     </span>
    // const pureRewardToRiskSumBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnLiveMacd', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnLiveMacd')} />
    //     </span>
    //DELETED FOR CLIENT VERSION
    // const pureRewardToRiskSumBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('pureRewardToRiskSumBasedOnLiveMacd', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('pureRewardToRiskSumBasedOnLiveMacd')} />
    //     </span>
    // const exchangeTotalCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeTotalCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeTotalCountBasedOnLiveMacd')} />
    //     </span>
    // const exchangeWinCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinCountBasedOnLiveMacd')} />
    //     </span>
    // const exchangeLossCountBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeLossCountBasedOnLiveMacd', 'integer')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeLossCountBasedOnLiveMacd')} />
    //     </span>
    // const exchangeWinRatioBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangeWinRatioBasedOnLiveMacd', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangeWinRatioBasedOnLiveMacd')} />
    //     </span>
    // const exchangePureRewardToRiskSumBasedOnLiveMacdFilter =
    //     <span className="flex filterButtons">
    //         <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('exchangePureRewardToRiskSumBasedOnLiveMacd', 'decimal')} />
    //         <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('exchangePureRewardToRiskSumBasedOnLiveMacd')} />
    //     </span>

    // let headerGroup = (
    //     <ColumnGroup>
    //         <Row>
    //             <Column field="histogram" header="Histogrm" sortable rowSpan={2} style={{ border: "solid #989898", borderBottom: "0px", 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Based On Ref Candle" colSpan={5} style={{ border: "solid #989898", 'minWidth': '500px', width: '500px' }} />
    //             <Column header="Based On Live Price" colSpan={5} style={{ border: "solid #989898", 'minWidth': '500px', width: '500px' }} />
    //             <Column header="Based On Live Macd" colSpan={5} style={{ border: "solid #989898", 'minWidth': '500px', width: '500px' }} />
    //         </Row>
    //         <Row>
    //             <Column header="Total Count" sortable field="totalCountBasedOnRefCandle" style={{ borderLeft: "solid #989898", 'minWidth': '50px', width: '100px' }} filter filterElement={totalCountBasedOnRefCandleFilter} />
    //             <Column header="Win Count" sortable field="winCountBasedOnRefCandle" filter filterElement={winCountBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Loss Count" sortable field="lossCountBasedOnRefCandle" filter filterElement={lossCountBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Win Ratio" sortable field="winRatioBasedOnRefCandle" filter filterElement={winRatioBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="R/R" sortable field="pureRewardToRiskSumBasedOnRefCandle" filter filterElement={pureRewardToRiskSumBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             {/* //DELETED FOR CLIENT VERSION */}
    //             {/* <Column header="R/R Pure" sortable field="pureRewardToRiskSumBasedOnRefCandle" filter filterElement={pureRewardToRiskSumBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} /> */}
    //             {/* <Column header="Exchange Total Count" sortable field="exchangeTotalCountBasedOnRefCandle" className="exchange-col" filter filterElement={exchangeTotalCountBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Count" sortable field="exchangeWinCountBasedOnRefCandle" className="exchange-col" filter filterElement={exchangeWinCountBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Loss Count" sortable field="exchangeLossCountBasedOnRefCandle" className="exchange-col" filter filterElement={exchangeLossCountBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Ratio" sortable field="exchangeWinRatioBasedOnRefCandle" className="exchange-col" filter filterElement={exchangeWinRatioBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange R/R Pure" sortable field="exchangePureRewardToRiskSumBasedOnRefCandle" className="exchange-col" filter filterElement={exchangePureRewardToRiskSumBasedOnRefCandleFilter} style={{ 'minWidth': '50px', width: '100px' }} /> */}

    //             <Column header="Total Count" sortable field="totalCountBasedOnLivePrice" style={{ borderLeft: "solid #989898", 'minWidth': '50px', width: '100px' }} filter filterElement={totalCountBasedOnLivePriceFilter} />
    //             <Column header="Win Count" sortable field="winCountBasedOnLivePrice" filter filterElement={winCountBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Loss Count" sortable field="lossCountBasedOnLivePrice" filter filterElement={lossCountBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Win Ratio" sortable field="winRatioBasedOnLivePrice" filter filterElement={winRatioBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="R/R" sortable field="pureRewardToRiskSumBasedOnLivePrice" filter filterElement={pureRewardToRiskSumBasedOnLivePriceFilter} />
    //             {/* <Column header="R/R Pure" sortable field="pureRewardToRiskSumBasedOnLivePrice" filter filterElement={pureRewardToRiskSumBasedOnLivePriceFilter} /> */}
    //             {/* <Column header="Exchange Total Count" sortable field="exchangeTotalCountBasedOnLivePrice" className="exchange-col" filter filterElement={exchangeTotalCountBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Count" sortable field="exchangeWinCountBasedOnLivePrice" className="exchange-col" filter filterElement={exchangeWinCountBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Loss Count" sortable field="exchangeLossCountBasedOnLivePrice" className="exchange-col" filter filterElement={exchangeLossCountBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Ratio" sortable field="exchangeWinRatioBasedOnLivePrice" className="exchange-col" filter filterElement={exchangeWinRatioBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange R/R Pure" sortable field="exchangePureRewardToRiskSumBasedOnLivePrice" className="exchange-col" filter filterElement={exchangePureRewardToRiskSumBasedOnLivePriceFilter} style={{ 'minWidth': '50px', width: '100px' }} /> */}

    //             <Column header="Total Count" sortable field="totalCountBasedOnLiveMacd" style={{ borderLeft: "solid #989898", 'minWidth': '50px', width: '100px' }} filter filterElement={totalCountBasedOnLiveMacdFilter} />
    //             <Column header="Win Count" sortable field="winCountBasedOnLiveMacd" filter filterElement={winCountBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Loss Count" sortable field="lossCountBasedOnLiveMacd" filter filterElement={lossCountBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Win Ratio" sortable field="winRatioBasedOnLiveMacd" filter filterElement={winRatioBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="R/R" sortable field="pureRewardToRiskSumBasedOnLiveMacd" filter filterElement={pureRewardToRiskSumBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             {/* <Column header="R/R Pure" sortable field="pureRewardToRiskSumBasedOnLiveMacd" filter filterElement={pureRewardToRiskSumBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} /> */}
    //             {/* <Column header="Exchange Total Count" sortable field="exchangeTotalCountBasedOnLiveMacd" className="exchange-col" filter filterElement={exchangeTotalCountBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Count" sortable field="exchangeWinCountBasedOnLiveMacd" className="exchange-col" filter filterElement={exchangeWinCountBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Loss Count" sortable field="exchangeLossCountBasedOnLiveMacd" className="exchange-col" filter filterElement={exchangeLossCountBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange Win Ratio" sortable field="exchangeWinRatioBasedOnLiveMacd" className="exchange-col" filter filterElement={exchangeWinRatioBasedOnLiveMacdFilter} style={{ 'minWidth': '50px', width: '100px' }} />
    //             <Column header="Exchange R/R Pure" sortable field="exchangePureRewardToRiskSumBasedOnLiveMacd" style={{ borderRight: "solid #989898", 'minWidth': '50px', width: '100px' }} className="exchange-col" filter filterElement={exchangePureRewardToRiskSumBasedOnLiveMacdFilter} /> */}
    //         </Row>
    //     </ColumnGroup>
    // )

    const columns = [
        {
            ...columnHelper.defaultColumn,
            header: "Histogrm",
            field: "histogram",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' },
            className: "text-center",
        },

        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "totalCountBasedOnRefCandle",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.totalCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     bodyStyle: { borderLeft: "solid #989898" }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "winCountBasedOnRefCandle",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "lossCountBasedOnRefCandle",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.lossCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "winRatioBasedOnRefCandle",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRatioBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "rewardToRiskSumBasedOnRefCandle",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSumBasedOnRefCandle",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeTotalCountBasedOnRefCandle",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeTotalCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinCountBasedOnRefCandle",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeLossCountBasedOnRefCandle",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeLossCountBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRatioBasedOnRefCandle",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRatioBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangePureRewardToRiskSumBasedOnRefCandle",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangePureRewardToRiskSumBasedOnRefCandle),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },


        {
            ...columnHelper.defaultColumn,
            header: "Total Count",
            field: "totalCountBasedOnLivePrice",
            sortable: true,
            className: "text-center",
            // filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.totalCountBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '100px' },
        },

        {
            ...columnHelper.defaultColumn,
            header: "Win Count",
            field: "winCountBasedOnLivePrice",
            sortable: true,
            className: "text-center",
            // filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winCountBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '100px' }
        },

        {
            ...columnHelper.defaultColumn,
            header: "Loss Count",
            field: "lossCountBasedOnLivePrice",
            sortable: true,
            className: "text-center",
            // filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.lossCountBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '100px' }
        },

        {
            ...columnHelper.defaultColumn,
            header: "Win Ratio",
            field: "winRatioBasedOnLivePrice",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            className: "text-center",
            // filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRatioBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '100px' }
        },

        {
            ...columnHelper.defaultColumn,
            header: "R/R",
            field: "rewardToRiskSumBasedOnLivePrice",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            className: "text-center",
            // filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '100px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSumBasedOnLivePrice",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeTotalCountBasedOnLivePrice",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeTotalCountBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinCountBasedOnLivePrice",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinCountBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeLossCountBasedOnLivePrice",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeLossCountBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRatioBasedOnLivePrice",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRatioBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangePureRewardToRiskSumBasedOnLivePrice",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangePureRewardToRiskSumBasedOnLivePrice),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "totalCountBasedOnLiveMacd",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.totalCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     bodyStyle: { borderLeft: "solid #989898" }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "winCountBasedOnLiveMacd",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "lossCountBasedOnLiveMacd",
        //     sortable: true,
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.lossCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "winRatioBasedOnLiveMacd",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.winRatioBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "rewardToRiskSumBasedOnLiveMacd",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSumBasedOnLiveMacd",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "text-center",
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.pureRewardToRiskSumBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeTotalCountBasedOnLiveMacd",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeTotalCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinCountBasedOnLiveMacd",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeLossCountBasedOnLiveMacd",
        //     sortable: true,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeLossCountBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRatioBasedOnLiveMacd",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangeWinRatioBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     className: "text-center exchange-col"
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangePureRewardToRiskSumBasedOnLiveMacd",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.exchangePureRewardToRiskSumBasedOnLiveMacd),
        //     style: { 'minWidth': '50px', width: '100px' },
        //     bodyStyle: { borderRight: "solid #989898" },
        //     className: "text-center exchange-col"
        // }
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
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "isExchangeData",
        //     label: "Is Exchange Data?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsExchangeData,
        //     setState: setSelectedServerIsExchangeData
        // },
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
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "minTotalCount",
            label: "Min Total Count",
            type: FilterType.Number,
            state: selectedServerMinTotalCount,
            setState: setSelectedServerMinTotalCount
        },
        {
            name: "minWinRatio",
            label: "Min Win Ratio",
            type: FilterType.Decimal,
            state: selectedServerMinWinRatio,
            setState: setSelectedServerMinWinRatio
        },
        {
            name: "includePositionsRecords",
            label: "Include Positions Records",
            type: FilterType.Switch,
            state: selectedServerIncludePositionsRecords,
            setState: setSelectedServerIncludePositionsRecords
        },
        {
            name: "histogramNumber",
            label: "Histogram Number",
            type: FilterType.Number,
            state: selectedServerHistogramNumber,
            setState: setSelectedServerHistogramNumber
        },
    ]

    const header = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(data, "histogram-winning-ratio")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
        </div>
    )

    return (
        <div id="histogram-winning-ratio-report">
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
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
            <Card style={{ width: '100%', marginBottom: '2em' }}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStrategy" className="align-self-baseline">Strategy</label>
                        <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                            onChange={onSelectStrategyChange} onHide={onSelectStrategyHide} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverBacktests" className="align-self-baseline">Backtests</label>
                        <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                            onChange={onSelectBackTestChange} onHide={onSelectBackTestHide} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                            onChange={onTimeFrameSelectChange} placeholder="Select a Time Frame" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverSymbol" className="align-self-baseline">Symbols</label>
                        <div className="w-full flex align-self-end">
                            <MultiSelect id='serverSymbol' value={selectedServerSymbols} options={symbols} filter showClear
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="w-full align-self-end" />
                        </div>
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
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsExchangeData" className="align-self-baseline">Is Exchange Data?</label>
                        <Dropdown id='serverIsExchangeData' value={selectedServerIsExchangeData} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsExchangeData(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber id="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance} onValueChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverMinTotalCount" className="align-self-baseline">Min Total Count</label>
                        <InputNumber id="serverMinTotalCount" value={selectedServerMinTotalCount} onValueChange={(e) => setSelectedServerMinTotalCount(e.value)}
                            showButtons className="w-full align-self-end" />
                        <span className='empty-space'>.</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverMinWinRatio" className="align-self-baseline">Min Win Ratio</label>
                        <InputNumber id="serverMinWinRatio" value={selectedServerMinWinRatio} onValueChange={(e) => setSelectedServerMinWinRatio(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={2} min={0} max={1} showButtons className="w-full align-self-end" />
                        <span className='empty-space'>.</span>
                    </div>
                    <ReactTooltip id="tooltip-histogram" place="bottom">
                        <div><Image src={tooltipImage} alt="stopParameters help" width='500' /></div>
                    </ReactTooltip>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-histogram">
                            <label htmlFor="serverHistogramNumber" className="align-self-baseline">Histogram Number</label>
                            <InputText id="serverHistogramNumber" value={selectedServerHistogramNumber} onChange={(e) => setSelectedServerHistogramNumber(e.target.value)}
                                className="w-full align-self-end" keyfilter={new RegExp('[0-9-.,]+$')} placeholder="Default: All" />
                            <span className='hint-lable'>1-5 or 2,6,7 or 4</span>
                        </TooltipWrapper>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap align-content-center">
                        <InputSwitch inputId="serverIncludePositionsRecords" checked={selectedServerIncludePositionsRecords} onChange={(e) => setSelectedServerIncludePositionsRecords(e.value)} />
                        <label htmlFor="serverIncludePositionsRecords" className="align-self-center ml-2">Include Positions Records</label>
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-histogram-winning-ratio"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    {/* DELETED FOR CLIENT VERSION  */}
                    {/* <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={totalPositionsCount} />
                    </div> */}
                    <div className="col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Count" value={currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={endDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Duration" value={duration} />
                    </div>
                </div>
            </Card>
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={data} className={"p-datatable-sm"} scrollable
                    showGridlines scrollDirection="both"
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    contextMenuSelection={selectedContent} sortMode="multiple"
                    // headerColumnGroup={headerGroup}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)} >

                    {columnHelper.generatColumns(columns)}

                </DataTable>
            </div>
            <PositionTable positions={positionsData} setPositions={setPositionsData} loading={loading}
                tableStateName={"dt-state-histogram-positions"} dataTableName="dt-state-histogram-positions" />
        </div>
    );
}

export default HistogramWinningRatioReport;