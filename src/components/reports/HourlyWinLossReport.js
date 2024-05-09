import React from 'react';
import moment from 'moment';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { InputNumber } from 'primereact/inputnumber';
import LabelWithValue from '../LabelWithValue';
import { exchangeServices } from '../../services/ExchangeServices';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import '../../assets/scss/HourlyWinLossReport.scss'
import FiltersStatement from '../FiltersStatement';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { reflowChart } from "../../utils/ReflowChart";
import { DataTable } from 'primereact/datatable';
import { ContextMenu } from 'primereact/contextmenu';
import { columnHelper } from '../../utils/ColumnHelper';
import { templates } from '../../utils/Templates';
import { IntervalHelper } from '../../utils/IntervalHelper';

//REPORT 3 (Statistical)
const HourlyWinLossReport = () => {
    const cm = React.useRef(null);
    const state = window.localStorage.getItem("server-filters-hourly-winloss");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const [data, setData] = React.useState({});
    const [winCountSum, setWinCountSum] = React.useState(0);
    const [lossCountSum, setLossCountSum] = React.useState(0);
    const [totalPositionsCount, setTotalPositionsCount] = React.useState(0);
    const [currentPositionsCount, setCurrentPositionsCount] = React.useState(0);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [duration, setDuration] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [reasonToNotEnters, setReasonToNotEnters] = React.useState([]);
    // const [pureRewardToRiskSums, setPureRewardToRiskSums] = React.useState([]);
    const [selectedServerReasonToNotEnters, setSelectedServerReasonToNotEnters] = React.useState(filtersDefValue.reasonToNotEnters ?? []);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerWinRatio, setSelectedServerWinRatio] = React.useState(filtersDefValue.winRatio);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedIsTehranTimeZone, setSelectedIsTehranTimeZone] = React.useState(filtersDefValue.isTehranTimeZone ?? 'false');
    const [selectedTimeDivision, setSelectedTimeDivision] = React.useState(filtersDefValue.timeDivision ?? 1);
    const [selectedServerPureRewardToRiskSum, setSelectedServerPureRewardToRiskSum] = React.useState(filtersDefValue.pureRewardToRiskSum);
    const [selectedServerPureRewardToRisk, setSelectedServerPureRewardToRisk] = React.useState(filtersDefValue.pureRewardToRisk);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const chart = React.useRef(null);
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
        xAxis: {
            categories: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'],
            title: {
                text: null
            }
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return this.axis.defaultLabelFormatter.call(this);
                }
            }
        },
        tooltip: {
            valueDecimals: 2,
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
    const [chartOptions, setChartOptions] = React.useState(defaultOptions);

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

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const timeZoneSelection = [
        { label: 'GMT', value: 'false' },
        { label: 'Tehran (GMT+3:30)', value: 'true' }
    ];

    const timeDivisionSelection = [
        { label: '15 minutes', value: 15 },
        { label: '30 minutes', value: 30 },
        { label: '1 hour', value: 1 },
        { label: '4 hours', value: 4 },
        { label: '6 hours', value: 6 },
        { label: '12 hours', value: 12 }
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
        if (selectedServerReasonToNotEnters && selectedServerReasonToNotEnters.length !== 0) {
            filtersStatement.push({
                name: "Reason To Not Enter: ",
                description: (selectedServerReasonToNotEnters.length === 1
                    ? `Get positions that didn't enter the market with reason '<strong>${selectedServerReasonToNotEnters}</strong>'`
                    : `Get positions that didn't enter the market with <strong>${selectedServerReasonToNotEnters.length}</strong> reasons`)
            })
        }
        if (selectedServerWinRatio) {
            filtersStatement.push({
                name: "Min Win Ratio (Percentage): ",
                description: (`Get positions with win ratio greater than or equal to <strong>${selectedServerWinRatio}%</strong> per hour`)
            })
        }
        if (selectedServerRewardToRiskTolerance) {
            filtersStatement.push({
                name: "R/R Tolerance: ",
                description: `Calculate r/r sum with telorance <strong>${selectedServerRewardToRiskTolerance}</strong>`
            })
        }
        //DELETED FOR CLIENT VERSION
        // filtersStatement.push({
        //     name: "Is Exchange Data?: ",
        //     description: (selectedServerIsExchangeData === 'true'
        //         ? `Get bot's wins or losses positions that registered in Exchange and synced with Exchange's positions'`
        //         : `Get bot's wins or losses positions that didn't register in Exchange or didn't sync with Exchange's positions`)
        // })
        // if (selectedServerPureRewardToRiskSum) {
        //     filtersStatement.push({
        //         name: "Min R/R Sum: ",
        //         description: (`Get positions with reward to risk sum greater than or equal to <strong>${selectedServerPureRewardToRiskSum}</strong> per hour`)
        //     })
        // }
        // if (selectedServerPureRewardToRisk) {
        //     filtersStatement.push({
        //         name: "Min R/R Pure: ",
        //         description: (`Get positions with pure reward to risk sum less than or equal to <strong>${selectedServerPureRewardToRisk}</strong> per hour`)
        //     })
        // }
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonToNotEnters
        , selectedServerWinRatio, selectedServerRewardToRiskTolerance]);//, selectedServerIsExchangeData, selectedServerPureRewardToRiskSum, selectedServerPureRewardToRisk

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
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
            setDefaultSymbols(data);
        });
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });

        scalpServices.getReasonsToNotEnter().then(data => {
            setReasonToNotEnters(data);
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
        let start = null;
        let end = null;
        let symbols = null;
        let reasonToNotEnters = null;
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

        if (!reasonToNotEnters && selectedServerReasonToNotEnters && selectedServerReasonToNotEnters.length > 0)
            reasonToNotEnters = selectedServerReasonToNotEnters.join();

        scalpServices.getHourlyWinLossReport(strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, reasonToNotEnters, selectedServerWinRatio, selectedServerPureRewardToRiskSum
            , selectedServerPureRewardToRisk, selectedServerIsExchangeData, selectedServerRewardToRiskTolerance
            , selectedTimeDivision, selectedIsTehranTimeZone).then(data => {
                setTotalPositionsCount(data.totalPositionsCount);
                setCurrentPositionsCount(data.currentPositionsCount);
                setStartDate(data.startDate);
                setEndDate(data.endDate);
                setDuration(data.duration);
                setWinCountSum(data.winCountSum);
                setLossCountSum(data.lossCountSum);
                setData(data);
                updateChartData(data.chartData);
                loadChartXLables(data.chartData);
                setLoading(false);
            });
    }

    const loadChartXLables = (data) => {
        if (data) {
            var lables = data.map((x) => x.hourStr);
            setChartOptions(prevState => ({
                ...prevState, xAxis: {
                    categories: lables,
                    title: {
                        text: null
                    }
                }
            }));
        }
        return [];
    }

    const updateChartData = (data) => {
        let totalSeries = [];
        totalSeries.push({
            type: 'column',
            name: "Win Count",
            color: "lightGreen",
            data: data?.map(dt => { return dt.winsCount }),
        });
        totalSeries.push({
            type: 'column',
            name: "Loss Count",
            color: "red",
            data: data?.map(dt => { return dt.lossesCount }),
        });
        //DELETED FOR CLIENT VERSION
        // totalSeries.push({
        //     type: 'column',
        //     name: "Pure r/r sum",
        //     data: data?.map(dt => {
        //         return {
        //             y: parseFloat(contentHelper.digitFormat(dt.pureRewardToRiskSum, 2))
        //             , color: (dt.pureRewardToRiskSum > 0 ? "lightBlue" : "gray")
        //         }
        //     }),
        // });
        totalSeries.push({
            type: 'column',
            name: "R/R Sum",
            data: data?.map(dt => {
                return {
                    y: parseFloat(contentHelper.digitFormat(dt.rewardToRiskSum, 2))
                    , color: "lightBlue"
                }
            }),
        });

        setChartOptions(prevState => ({
            ...prevState, series: totalSeries
        }));
    }

    const columns = [
        {
            ...columnHelper.defaultColumn,
            columnKey: "rowNumber",
            bodyClassName: "text-center",
            style: { 'minWidth': '25px', width: '50px' },
            body: (col, context) => context.rowIndex + 1,
            headerClassName: "text-center",
            header: "#"
        },
        {
            ...columnHelper.defaultColumn,
            field: "hourStr",
            header: "Hour",
            sortable: true,
            headerClassName: "text-center",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            headerClassName: "text-center",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSum",
        //     header: "Pure R/R Sum",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
        //     headerClassName: "text-center",
        //     bodyClassName: "text-center",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "R/R Sum",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            headerClassName: "text-center",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
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
            name: "reasonToNotEnters",
            label: "Reason To Not Enter",
            type: FilterType.MultiSelect,
            options: reasonToNotEnters,
            state: selectedServerReasonToNotEnters,
            setState: setSelectedServerReasonToNotEnters
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
            name: "winRatio",
            label: "Min Win Ratio",
            type: FilterType.Number,
            state: selectedServerWinRatio,
            setState: setSelectedServerWinRatio
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "timeZone",
            label: "Time Zone",
            options: timeZoneSelection,
            type: FilterType.DropDown,
            state: selectedIsTehranTimeZone,
            setState: setSelectedIsTehranTimeZone
        },
        {
            name: "timeDivision",
            label: "Time Division",
            options: timeDivisionSelection,
            type: FilterType.DropDown,
            state: selectedTimeDivision,
            setState: setSelectedTimeDivision
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "pureRewardToRisk",
        //     label: "Min Pure R/R",
        //     type: FilterType.Decimal,
        //     state: selectedServerPureRewardToRisk,
        //     setState: setSelectedServerPureRewardToRisk
        // },
        // {
        //     name: "pureRewardToRiskSum",
        //     label: "Min Pure R/R Sum",
        //     type: FilterType.Decimal,
        //     state: selectedServerPureRewardToRiskSum,
        //     setState: setSelectedServerPureRewardToRiskSum
        // },
    ]

    const footer = (
        <div className="table-footer-container flex-wrap align-items-center">
            Summary:
            {data.summary && data.summary.map((x) => {
                if (x.isPositive)
                    return <strong className='ml-3' style={{ color: "lightGreen" }}>{x.hourStr}</strong>
                else
                    return <strong className='ml-3' style={{ color: "red" }}>{x.hourStr}</strong>
            })}
        </div>
    )

    return (
        <div id="hourly-win-loss-report">
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonToNotEnters} options={reasonToNotEnters} filter showClear
                            onChange={(e) => setSelectedServerReasonToNotEnters(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsExchangeData" className="align-self-baseline">Is Exchange Data?</label>
                        <Dropdown id='serverIsExchangeData' value={selectedServerIsExchangeData} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsExchangeData(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    {/* <div className="col-0 md:col-0 lg:col-3"></div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverWinRatio" className="align-self-baseline">Min Win Ratio (Percentage)</label>
                        <InputNumber value={selectedServerWinRatio} onValueChange={(e) => setSelectedServerWinRatio(e.value)}
                            min={0} max={100} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber id="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance} onValueChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="timeZone" className="align-self-baseline">Time Zone</label>
                        <Dropdown id='timeZone' value={selectedIsTehranTimeZone} options={timeZoneSelection}
                            onChange={(e) => setSelectedIsTehranTimeZone(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="timeDivision" className="align-self-baseline">Time Division</label>
                        <Dropdown id='timeDivision' value={selectedTimeDivision} options={timeDivisionSelection}
                            onChange={(e) => setSelectedTimeDivision(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPureRewardToRisk" className="align-self-baseline">Min Pure R/R</label>
                        <InputNumber value={selectedServerPureRewardToRisk} onValueChange={(e) => setSelectedServerPureRewardToRisk(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPureRewardToRiskSum" className="align-self-baseline">Min Pure R/R Sum</label>
                        <InputNumber value={selectedServerPureRewardToRiskSum} onValueChange={(e) => setSelectedServerPureRewardToRiskSum(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div> */}
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-hourly-winloss"
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
                        <LabelWithValue className="p-inputgroup" displayText="Win Count Sum" value={winCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Loss Count Sum" value={lossCountSum} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4"></div>
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
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={chartOptions}
                ref={chart} />
            <Card className='mt-3'>
                <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
                <DataTable value={data?.dataTable ?? []} className={"p-datatable-sm"}
                    showGridlines scrollDirection="both" scrollable footer={footer}
                    contextMenuSelection={selectedContent} onContextMenuSelectionChange={e => setSelectedContent(e)} scrollHeight="550px"
                    cellClassName={(data, options) => options.field} onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-hourly-report")}
                </DataTable>
            </Card>
        </div >);
}

export default HourlyWinLossReport;