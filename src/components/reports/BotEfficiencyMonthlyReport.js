import moment from "moment";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputSwitch } from "primereact/inputswitch";
import { MultiSelect } from "primereact/multiselect";
import React, { useRef, useState } from "react";
import { scalpServices } from "../../services/ScalpServices";
import { dateHelper } from "../../utils/DateHelper";
import { FilterType } from "../../utils/FilterType";
import FilterManager from "../FilterManager";
import '../../assets/scss/BotEfficiencyMonthlyReport.scss';
import { RadioButton } from 'primereact/radiobutton';
import { contentHelper } from "../../utils/ContentHelper";
import { exchangeServices } from "../../services/ExchangeServices";
import LabelWithValue from "../LabelWithValue";
import HighchartsReact from "highcharts-react-official";
import Indicators from "highcharts/indicators/indicators-all.js";
import DragPanes from "highcharts/modules/drag-panes.js";
import AnnotationsAdvanced from "highcharts/modules/annotations-advanced.js";
import PriceIndicator from "highcharts/modules/price-indicator.js";
import FullScreen from "highcharts/modules/full-screen.js";
import StockTools from "highcharts/modules/stock-tools.js";
import Exporting from "highcharts/modules/exporting.js";
import Highcharts from 'highcharts/highstock';
import { reflowChart } from "../../utils/ReflowChart";
import { SelectButton } from "primereact/selectbutton";
import { IntervalHelper } from "../../utils/IntervalHelper";
import { InputNumber } from "primereact/inputnumber";

Indicators(Highcharts);
DragPanes(Highcharts);
AnnotationsAdvanced(Highcharts);
PriceIndicator(Highcharts);
FullScreen(Highcharts);
StockTools(Highcharts);
Exporting(Highcharts);

//REPORT 14 (Statistical)
const BotEfficiencyMonthlyReport = () => {
    const state = window.localStorage.getItem("server-filters-botefficiencymonthlyreport");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerGroupBySymbols, setSelectedServerGroupBySymbols] = React.useState(filtersDefValue.groupBySymbols ?? false);
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
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerPotentialRewardToRisk, setSelectedServerPotentialRewardToRisk] = React.useState();
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
    const [selectedServerHasDoubleDivergences, setSelectedServerHasDoubleDivergences] = React.useState(filtersDefValue.hasDoubleDivergences);
    const [selectedServerHasProperOverlap, setSelectedServerHasProperOverlap] = React.useState(filtersDefValue.hasProperOverlap);
    const [selectedServerHasProperElongation, setSelectedServerHasProperElongation] = React.useState(filtersDefValue.hasProperElongation);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerIsPinBar, setSelectedServerIsPinBar] = React.useState(filtersDefValue.isPinBar);

    const [loading, setLoading] = React.useState(false);
    const [reportData, setReportData] = React.useState({});
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [selectedOption, setSelectedOption] = React.useState('reward-risk');
    const [visibleSymbol, setVisibleSymbol] = React.useState(false);
    const [chartType, setChartType] = React.useState('column');
    const chart = useRef(null);
    const positionTypechart = useRef(null);
    const summaryChart = useRef(null);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);

    const chartTypes = [
        { label: 'Efficiency per month', value: 'column' },
        { label: 'Total profit balance', value: 'spline' },
    ]

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

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

    const defaultOptions = {
        chart: {
            height: "50%",
            zoomType: 'x'
        },
        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return this.axis.defaultLabelFormatter.call(this) + 'R';
                }
            }
        },
        tooltip: {
            valueDecimals: 2,
            valueSuffix: 'R'
        },
        rangeSelector: {
            enabled: false
        },
        stockTools: {
            gui: {
                enabled: false
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    chart: {
                        height: "200%"
                    },
                }
            }]
        },
        series: []
    }
    // const positionTypeDefaultOptions = {
    //     chart: {
    //         height: "50%",
    //         zoomType: 'x'
    //     },
    //     legend: {
    //         enabled: true,
    //         layout: 'vertical',
    //         align: 'right',
    //         verticalAlign: 'middle'
    //     },
    //     rangeSelector: {
    //         enabled: false
    //     },
    //     stockTools: {
    //         gui: {
    //             enabled: false
    //         }
    //     },
    //     responsive: {
    //         rules: [{
    //             condition: {
    //                 maxWidth: 600
    //             },
    //             chartOptions: {
    //                 chart: {
    //                     height: "200%"
    //                 },
    //             }
    //         }]
    //     },
    //     series: []
    // }
    const [monthlyReportOptions, setMonthlyReportOptions] = useState(defaultOptions);
    const [monthlyReportBasedOnSymbolOptions, setMonthlyReportBasedOnSymbolOptions] = useState(defaultOptions);
    const [positionTypeMonthlyReportOptions, setPpositionTypeMonthlyReportOptions] = useState(defaultOptions);
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
        reflowChart.attach(chart);
        reflowChart.attach(summaryChart);

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

    React.useEffect(() => {
        if (reportData?.monthsOfYears)
            loadChart(reportData);
    }, [selectedOption, chartType]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setLoading(true);
        let start = null;
        let end = null;
        let symbols = null;
        let strategies = null;
        let backtests = null;
        let reasonsToNotEnter = null;

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

        scalpServices.getBotEfficiencyMonthlyReport(symbols, selectedServerInterval, selectedServerPackSize, start, end,
            selectedServerIsSucceed, selectedServerIsEnteredPosition, selectedServerIsRegisteredInMarket,
            strategies, backtests, selectedServerHasHighCommission, selectedServerIsOutOfTradeActiveHours,
            selectedServerIsExchangeData, selectedServerHasDoubleDivergences, selectedServerRefCandlePattern,
            selectedServerHasProperElongation, selectedServerHasProperOverlap, selectedServerPattern3Value
            , selectedServerRefCandleBodyRatio, selectedServerRefCandleShadowsDifference, selectedServerIsPinBar, reasonsToNotEnter,
            selectedServerLowerTimeFrameDivergenceIn, selectedServerGroupBySymbols, selectedServerRewardToRiskTolerance , selectedServerPotentialRewardToRisk).then(data => {
                setLoading(false);
                setReportData(data);
                loadChart(data);
                setVisibleSymbol(selectedServerGroupBySymbols);
            });
    }

    const loadChart = (totalData) => {
        setMonthlyReportOptions(defaultOptions);
        setMonthlyReportBasedOnSymbolOptions(defaultOptions);
        setPpositionTypeMonthlyReportOptions(defaultOptions);

        var visibleLegends = [];
        if (visibleSymbol) {
            visibleLegends = chart.current.chart.series.filter(x => x.visible === true).map(x => x.name);
        }

        if (!totalData || totalData.length === 0) {
            setLoading(false);
            return;
        }

        //DELETED FOR CLIENT VERSION
        // var sumName = ``;
        // switch (selectedOption) {
        //     case 'reward-risk':
        //         sumName = `rewardToRiskSum`;
        //         break;
        // case 'pure-reward-risk':
        //     sumName = `pureRewardToRiskSum`;
        //     break;
        // case 'exchange-pure-reward-risk':
        //     sumName = `exchangePureRewardToRiskSum`;
        //     break;
        // case 'exchange-reward-risk':
        //     sumName = `exchangeRewardToRiskSum`;
        //     break;
        //     default:
        //         break;
        // }

        let totalSeries = [];
        if (selectedServerGroupBySymbols) {
            totalData?.symbols?.forEach((symbol, indx) => {
                var data = chartType === 'spline'
                    ? totalData?.monthlyRewardToRiskSumBasedOnSymbol?.filter(m => m.symbol === symbol)
                    : totalData?.monthlyRewardToRiskBasedOnSymbol?.filter(m => m.symbol === symbol);
                let sumData = data?.map(dt => ({ x: dt.time, y: dt.rewardToRiskSum }));
                // let sumData = data?.map(dt => ({ x: dt.time, y: dt[sumName] }));

                totalSeries.push({
                    type: sumData.length === 1 && chartType === 'spline' ? 'scatter' : chartType,
                    name: symbol,
                    data: sumData,
                    visible: visibleLegends.length === 0 && indx === 0 ? true : visibleLegends.some(x => x === symbol)
                });
            });

            setMonthlyReportBasedOnSymbolOptions(prevState => ({
                ...prevState, series: totalSeries
            }));
        }
        else {
            let sumData = chartType === 'spline'
                ? totalData?.monthlyRewardToRiskSum?.map(dt => ({ x: dt.time, y: dt.rewardToRiskSum, color: dt.rewardToRiskSum > 0 ? "Green" : "Red" }))
                : totalData?.monthlyRewardToRisk?.map(dt => ({ x: dt.time, y: dt.rewardToRiskSum, color: dt.rewardToRiskSum > 0 ? "Green" : "Red" }));
            totalSeries.push({
                type: chartType,
                name: "All",
                data: sumData,
                color: sumData?.map(x => x.y)?.reduce((a, b) => a + b, 0) > 0 ? "green" : "red"
            });
            setMonthlyReportOptions(prevState => ({
                ...prevState, series: totalSeries
            }));
        }

        let longData = totalData?.monthlyRewardToRisk?.map(dt => ({ x: dt.time, y: dt.longCount, color: "lightBlue" }));
        let shortData = totalData?.monthlyRewardToRisk?.map(dt => ({ x: dt.time, y: dt.shortCount, color: "gray" }));
        var positionTypeSeries = [{
            type: "column",
            name: "Long",
            data: longData,
            color: "lightBlue"
        },
        {
            type: "column",
            name: "Short",
            data: shortData,
            color: "gray"
        },
        // {
        //     type: "spline",
        //     name: "BTC",
        //     data: shortData,
        //     color: "blue"
        // }
    ];
        positionTypeSeries.push();
        setPpositionTypeMonthlyReportOptions(prevState => ({
            ...prevState, series: positionTypeSeries
        }));

        setLoading(false);
    }

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
        {
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
        //     name: "isPinBar",
        //     label: "Has Pin Bar Pattern?",
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsPinBar,
        //     setState: setSelectedServerIsPinBar
        // },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "groupBySymbols",
            label: "Group By Symbols",
            type: FilterType.Switch,
            state: selectedServerGroupBySymbols,
            setState: setSelectedServerGroupBySymbols
        }
    ]

    const renderTbody = () => {
        if (visibleSymbol) {
            var symbolsRewardToRisk = [];
            switch (selectedOption) {
                case 'reward-risk':
                    symbolsRewardToRisk = reportData?.monthlyRewardToRiskBasedOnSymbol?.map((x) => ({ key: x.symbol, value: x.rewardToRiskSum }));
                    break;
                //DELETED FOR CLIENT VERSION
                // case 'pure-reward-risk':
                //     symbolsRewardToRisk = reportData?.monthlyRewardToRiskBasedOnSymbol?.map((x) => ({ key: x.symbol, value: x.pureRewardToRiskSum }));
                //     break;
                // case 'exchange-pure-reward-risk':
                //     symbolsRewardToRisk = reportData?.monthlyRewardToRiskBasedOnSymbol?.map((x) => ({ key: x.symbol, value: x.exchangePureRewardToRiskSum }));
                //     break;
                // case 'exchange-reward-risk':
                //     symbolsRewardToRisk = reportData?.monthlyRewardToRiskBasedOnSymbol?.map((x) => ({ key: x.symbol, value: x.exchangeRewardToRiskSum }));
                //     break;
                default:
                    break;
            }
            return reportData.symbols && reportData.symbols.map((symbol, index) =>
                <tr key={index}>
                    <th className="title-cell" style={{ backgroundColor: "#fdfddb" }}>{symbol}</th>
                    {
                        // eslint-disable-next-line array-callback-return
                        reportData.monthsOfYears && reportData.monthsOfYears.map(x => {
                            var item = reportData.monthlyRewardToRiskBasedOnSymbol?.find(m => m.year === x.year && m.month === x.month && m.symbol === symbol);
                            switch (selectedOption) {
                                case 'reward-risk':
                                    var cellColor = item?.rewardToRiskSum ? (item.rewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                                    return (<td title={`${symbol}, ${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="reward-risk">{item?.rewardToRiskSum ? contentHelper.digitFormat(item?.rewardToRiskSum, 2) : ""}</p></td>)
                                //DELETED FOR CLIENT VERSION
                                // case 'pure-reward-risk':
                                //     cellColor = item?.pureRewardToRiskSum ? (item.pureRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                                //     return (<td title={`${symbol}, ${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="pure-reward-risk">{item?.pureRewardToRiskSum ? contentHelper.digitFormat(item?.pureRewardToRiskSum, 2) : ""}</p></td>)
                                // case 'exchange-pure-reward-risk':
                                //     cellColor = item?.exchangePureRewardToRiskSum ? (item.exchangePureRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                                //     return (<td title={`${symbol}, ${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="exchange-pure-reward-risk">{item?.exchangePureRewardToRiskSum ? contentHelper.digitFormat(item?.exchangePureRewardToRiskSum, 2) : ""}</p></td>)
                                // case 'exchange-reward-risk':
                                //     cellColor = item?.exchangeRewardToRiskSum ? (item.exchangeRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                                //     return (<td title={`${symbol}, ${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="exchange-reward-risk">{item?.exchangeRewardToRiskSum ? contentHelper.digitFormat(item?.exchangeRewardToRiskSum, 2) : ""}</p></td>)
                                default:
                                    break;
                            }
                        })
                    }
                    <th title={symbol} style={{
                        backgroundColor: "#E88503"
                        , color: `${symbolsRewardToRisk?.filter(m => m.key === symbol)?.reduce((a, b) => a + b.value, 0) >= 0 ? "#ffffff" : "#dd0000"}`
                    }}>
                        {contentHelper.digitFormat(symbolsRewardToRisk?.filter(m => m.key === symbol)?.reduce((a, b) => a + b.value, 0) ?? 0, 2)}
                    </th>
                </tr>
            )
        }

        var total = 0;
        switch (selectedOption) {
            case 'reward-risk':
                total = reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.rewardToRiskSum, 0) ?? 0;
                break;
            //DELETED FOR CLIENT VERSION
            // case 'pure-reward-risk':
            //     total = reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.pureRewardToRiskSum, 0) ?? 0;
            //     break;
            // case 'exchange-pure-reward-risk':
            //     total = reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.exchangePureRewardToRiskSum, 0) ?? 0;
            //     break;
            // case 'exchange-reward-risk':
            //     total = reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.exchangeRewardToRiskSum, 0) ?? 0;
            //     break;
            default:
                total = 0;
                break;
        }
        return (
            <tr>
                {
                    reportData.monthsOfYears && reportData.monthsOfYears.map(x => {
                        var item = reportData.monthlyRewardToRisk?.find(m => m.year === x.year && m.month === x.month);
                        switch (selectedOption) {

                            case 'reward-risk':
                                var cellColor = item?.rewardToRiskSum ? (item.rewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                                return (<td title={`${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="reward-risk">{item?.rewardToRiskSum ? contentHelper.digitFormat(item?.rewardToRiskSum, 2) : ""}</p></td>)
                            //DELETED FOR CLIENT VERSION
                            // case 'pure-reward-risk':
                            //     cellColor = item?.pureRewardToRiskSum ? (item.pureRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                            //     return (<td title={`${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="pure-reward-risk">{item?.pureRewardToRiskSum ? contentHelper.digitFormat(item?.pureRewardToRiskSum, 2) : ""}</p></td>)
                            // case 'exchange-pure-reward-risk':
                            //     cellColor = item?.exchangePureRewardToRiskSum ? (item.exchangePureRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                            //     return (<td title={`${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="exchange-pure-reward-risk">{item?.exchangePureRewardToRiskSum ? contentHelper.digitFormat(item?.exchangePureRewardToRiskSum, 2) : ""}</p></td>)
                            // case 'exchange-reward-risk':
                            //     cellColor = item?.exchangeRewardToRiskSum ? (item.exchangeRewardToRiskSum < 0 ? "#EC9294" : "white") : "#F1F1F1";
                            //     return (<td title={`${x.monthName}, ${x.year}`} style={{ backgroundColor: cellColor }}><p className="exchange-reward-risk">{item?.exchangeRewardToRiskSum ? contentHelper.digitFormat(item?.exchangeRewardToRiskSum, 2) : ""}</p></td>)

                            default:
                                return false
                        }
                    })
                }
                <th style={(total >= 0 ? { backgroundColor: "#E88503", color: "#ffffff" } : { backgroundColor: "#E88503", color: "#dd0000" })}>{contentHelper.digitFormat(total, 2)}</th>
            </tr>
        )
    }

    const renderFooter = () => {
        var total = 0;
        switch (selectedOption) {
            case 'reward-risk':
                total = contentHelper.digitFormat(reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.rewardToRiskSum, 0) ?? 0, 2);
                break;
            //DELETED FOR CLIENT VERSION
            // case 'pure-reward-risk':
            //     total = contentHelper.digitFormat(reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.pureRewardToRiskSum, 0) ?? 0, 2);
            //     break;
            // case 'exchange-pure-reward-risk':
            //     total = contentHelper.digitFormat(reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.exchangePureRewardToRiskSum, 0) ?? 0, 2);
            //     break;
            // case 'exchange-reward-risk':
            //     total = contentHelper.digitFormat(reportData?.monthlyRewardToRisk?.reduce((a, b) => a + b.exchangeRewardToRiskSum, 0) ?? 0, 2);
            //     break;
            default:
                total = 0;
                break;
        }

        return (
            <tr style={{ background: "#E88503", color: "white" }}>
                <th className="extetion-cell">Total</th>
                {
                    reportData.monthsOfYears && reportData.monthsOfYears.map(x => {
                        var item = reportData.monthlyRewardToRisk?.find(m => m.year === x.year && m.month === x.month);
                        switch (selectedOption) {
                            case 'reward-risk':
                                return (<th style={(item.rewardToRiskSum >= 0 ? { color: "#ffffff" } : { color: "#dd0000" })}
                                    title={`${x.monthName}, ${x.year}`} >{contentHelper.digitFormat(item.rewardToRiskSum, 2)}</th>)
                            //DELETED FOR CLIENT VERSION
                            // case 'pure-reward-risk':
                            //     return (<th style={(item.pureRewardToRiskSum >= 0 ? { color: "#ffffff" } : { color: "#dd0000" })}
                            //         title={`${x.monthName}, ${x.year}`} >{contentHelper.digitFormat(item.pureRewardToRiskSum, 2)}</th>)
                            // case 'exchange-pure-reward-risk':
                            //     return (<th style={(item.exchangePureRewardToRiskSum >= 0 ? { color: "#ffffff" } : { color: "#dd0000" })}
                            //         title={`${x.monthName}, ${x.year}`} >{contentHelper.digitFormat(item.exchangePureRewardToRiskSum, 2)}</th>)
                            // case 'exchange-reward-risk':
                            //     return (<th style={(item.exchangeRewardToRiskSum >= 0 ? { color: "#ffffff" } : { color: "#dd0000" })}
                            //         title={`${x.monthName}, ${x.year}`} >{contentHelper.digitFormat(item.exchangeRewardToRiskSum, 2)}</th>)

                            default:
                                return false
                        }

                    })
                }
                <th style={(total >= 0 ? { color: "#ffffff" } : { color: "#dd0000" })}>{total}</th>
            </tr>
        )
    }

    return (
        <div>
            <Card>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStrategy" className="align-self-baseline">Strategies</label>
                        <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                            onChange={onSelectStrategyChange} onHide={onSelectStrategyHide} placeholder="Select Strategies" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverBacktests" className="align-self-baseline">Back Tests</label>
                        <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                            onChange={onSelectBackTestChange} onHide={onSelectBackTestHide} placeholder="Select Back Tests" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                            onChange={onTimeFrameSelectChange} placeholder="Select a Time Frame" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverSymbols" className="align-self-baseline">Symbols</label>
                        <div className="w-full flex align-self-end">
                            <MultiSelect id='serverSymbols' value={selectedServerSymbols} options={symbols} filter showClear
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="flex-1" />
                        </div>
                    </div>
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsSucceed" className="align-self-baseline">Is Succeed (Target Hitted)?</label>
                        <Dropdown id='serverIsSucceed' value={selectedServerIsSucceed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsSucceed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsEnteredPosition" className="align-self-baseline">Has Enough Money To Enter Position?</label>
                        <Dropdown id='serverIsEnteredPosition' value={selectedServerIsEnteredPosition} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsEnteredPosition(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPotentialRewardToRisk" className="align-self-baseline">Min Potential R/R</label>
                        <InputNumber id="serverPotentialRewardToRisk" value={selectedServerPotentialRewardToRisk} onValueChange={(e) => setSelectedServerPotentialRewardToRisk(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
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
                        <label htmlFor="serverLowerTimeFrameDivergenceIn" className="align-self-baseline">Lower Time Frame Divergence In</label>
                        <Dropdown id='serverLowerTimeFrameDivergenceIn' value={selectedServerLowerTimeFrameDivergenceIn} options={lowerTimeFrameDivergenceSelection} showClear
                            onChange={(e) => setSelectedServerLowerTimeFrameDivergenceIn(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
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
                    <div className="col-12 md:col-12 flex flex-wrap align-content-center">
                        <InputSwitch inputId="serverGroupBySymbols" checked={selectedServerGroupBySymbols} onChange={(e) => setSelectedServerGroupBySymbols(e.value)} />
                        <label htmlFor="serverGroupBySymbols" className="align-self-center ml-2">Group By Symbols</label>
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto"
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} loading={loading} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-botefficiencymonthlyreport"
                            onSave={loadData} />
                    </div>
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    {/* DELETED FOR CLIENT VERSION  */}
                    {/* <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={reportData.totalPositionsCount} />
                    </div> */}
                    <div className="col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Count" value={reportData.currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={reportData.startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={reportData.endDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Duration" value={reportData.duration} />
                    </div>
                </div>
            </Card>
            <div className="field-radiobutton">
                <RadioButton className="ml-3" inputId="rewardToRiskSum" name="selectedOption" value="reward-risk" onChange={(e) => setSelectedOption(e.value)} checked={selectedOption === 'reward-risk'} />
                <label htmlFor="rewardToRiskSum">R/R Sum</label>
                {/* DELETED FOR CLIENT VERSION */}
                {/* <RadioButton className="ml-3" inputId="pureRewardToRiskSum" name="selectedOption" value="pure-reward-risk" onChange={(e) => setSelectedOption(e.value)} checked={selectedOption === 'pure-reward-risk'} />
                <label htmlFor="pureRewardToRiskSum">Pure R/R Sum</label>
                <RadioButton className="ml-3" inputId="exchangePureRewardToRiskSum" name="selectedOption" value="exchange-pure-reward-risk" onChange={(e) => setSelectedOption(e.value)} checked={selectedOption === 'exchange-pure-reward-risk'} />
                <label htmlFor="exchangePureRewardToRiskSum">Binanace Pure R/R Sum</label>
                <RadioButton className="ml-3" inputId="exchangeRewardToRiskSum" name="selectedOption" value="exchange-reward-risk" onChange={(e) => setSelectedOption(e.value)} checked={selectedOption === 'exchange-reward-risk'} />
                <label htmlFor="exchangeRewardToRiskSum">Binanace R/R Sum</label> */}
            </div>
            {reportData?.monthsOfYears && <Card>
                <SelectButton value={chartType} options={chartTypes} onChange={(e) => e.value && setChartType(e.value)} />
                {visibleSymbol && <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={'stockChart'}
                    options={monthlyReportBasedOnSymbolOptions}
                    ref={chart} />}
                {!visibleSymbol && <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={'stockChart'}
                    options={monthlyReportOptions}
                    ref={summaryChart} />}
                <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={'stockChart'}
                    options={positionTypeMonthlyReportOptions}
                    ref={positionTypechart} />
            </Card>}
            {reportData?.monthsOfYears && <Card className="mt-2">
                <div className="botefficiencymonthly-report-card">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th className="extetion-cell" rowSpan="2" style={{ backgroundColor: "#fdfddb", display: `${(visibleSymbol ? 'table-cell' : 'none')}` }}>Symbol</th>
                                {reportData.monthsOfYears && reportData.monthsOfYears.map((item) => {
                                    return (<td>{item.year}</td>)
                                })
                                }
                                <th rowSpan="2" style={{ backgroundColor: "#E88503", color: "white" }}>Total</th>
                            </tr>
                            <tr style={{ backgroundColor: "#fdfddb" }}>
                                {reportData.monthsOfYears && reportData.monthsOfYears.map((item) => {
                                    return (<th>{item.monthName}</th>)
                                })
                                }
                            </tr>
                        </thead>
                        <tbody >
                            {renderTbody()}
                        </tbody>
                        {selectedServerGroupBySymbols && <tfoot>
                            {renderFooter()}
                        </tfoot>}
                    </table>
                </div>
            </Card>}
        </div>
    );
}
export default BotEfficiencyMonthlyReport;