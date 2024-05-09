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
import { InputNumber } from 'primereact/inputnumber';
import { columnHelper } from '../../utils/ColumnHelper';
import { templates } from '../../utils/Templates';
import Export from '../Export';
import Paginator from '../Paginator';
import ColumnManager from '../ColumnManager';
import LabelWithValue from '../LabelWithValue';
import { Tooltip } from 'primereact/tooltip';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import { exchangeServices } from '../../services/ExchangeServices';
import '../../assets/scss/SymbolEfficiencyReport.scss'
import FiltersStatement from '../FiltersStatement';
import { IntervalHelper } from '../../utils/IntervalHelper';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

//REPORT 1 (Statistical)
const SymbolEfficiencyReport = () => {
    const state = window.localStorage.getItem("server-filters-symbol-efficiency");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const pg = React.useRef(null);
    const dt = React.useRef(null);
    const cm = React.useRef(null);
    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
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
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame ?? "15m");
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerTotalCount, setSelectedServerTotalCount] = React.useState(filtersDefValue.totalCount);
    const [selectedServerWinRate, setSelectedServerWinRate] = React.useState(filtersDefValue.winRate);
    const [selectedServerRewardToRiskAvg, setSelectedServerRewardToRiskAvg] = React.useState(filtersDefValue.rewardToRiskAvg);
    const [selectedServerRewardToRiskSum, setSelectedServerRewardToRiskSum] = React.useState(filtersDefValue.rewardToRiskSum);
    const [selectedServerCalculatedCommissionSum, setSelectedServerCalculatedCommissionSum] = React.useState(filtersDefValue.calculatedCommissionSum);
    const [selectedServerRewardToRiskPure, setSelectedServerRewardToRiskPure] = React.useState(filtersDefValue.rewardToRiskPure);
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerPotentialRewardToRisk, setSelectedServerPotentialRewardToRisk] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [positionsStartDate, setPositionsStartDate] = React.useState('');
    const [positionsEndDate, setPositionsEndDate] = React.useState('');
    const [positionsDuration, setPositionsDuration] = React.useState('');
    const [currentPositionsCount, setCurrentPositionsCount] = React.useState('');
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [multiSortMeta, setMultiSortMeta] = React.useState([]);
    const toast = React.useRef(null);

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
        {
            label: 'Copy Column Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copyColumn(filteredData, selectedContent.originalEvent.target.classList[0])
        }
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
        //DELETED FOR CLIENT VERSION
        // filtersStatement.push({
        //     name: "Is Exchange Data?: ",
        //     description: (selectedServerIsExchangeData === 'true'
        //         ? `Get bot's wins or losses positions that registered in Exchange and synced with Exchange's positions'`
        //         : `Get bot's wins or losses positions that didn't register in Exchange or didn't sync with Exchange's positions`)
        // })
        if (selectedServerTotalCount) {
            filtersStatement.push({
                name: "Min Total Count: ",
                description: (`Get symbols with number of positions greater than or equal to <strong>${selectedServerTotalCount}</strong>`)
            })
        }
        if (selectedServerWinRate) {
            filtersStatement.push({
                name: "Min Win Ratio: ",
                description: (`Get symbols with win ratio of positions greater than or equal to <strong>${selectedServerWinRate}%</strong>`)
            })
        }
        if (selectedServerRewardToRiskAvg) {
            filtersStatement.push({
                name: "Min R/R Avg: ",
                description: (`Get symbols with reward to risk average of positions greater than or equal to <strong>${selectedServerRewardToRiskAvg}</strong>`)
            })
        }
        if (selectedServerRewardToRiskSum) {
            filtersStatement.push({
                name: "Min R/R Sum: ",
                description: (`Get symbols with reward to risk sum of positions greater than or equal to <strong>${selectedServerRewardToRiskSum}</strong>`)
            })
        }
        //DELETED FOR CLIENT VERSION
        // if (selectedServerCalculatedCommissionSum) {
        //     filtersStatement.push({
        //         name: "Max Calculated Commission Sum: ",
        //         description: (`Get symbols with commission sum of positions less than or equal to <strong>${selectedServerCalculatedCommissionSum}</strong>`)
        //     })
        // }
        // if (selectedServerRewardToRiskPure) {
        //     filtersStatement.push({
        //         name: "Min R/R Pure: ",
        //         description: (`Get symbols with pure reward to risk sum of positions less than or equal to <strong>${selectedServerRewardToRiskPure}</strong>`)
        //     })
        // }
        if (selectedServerRewardToRiskTolerance) {
            filtersStatement.push({
                name: "R/R Tolerance: ",
                description: `Calculate r/r sum with telorance <strong>${selectedServerRewardToRiskTolerance}</strong>`
            })
        }

        if (selectedServerPotentialRewardToRisk) {
            filtersStatement.push({
                name: "Min Potential R/R: ",
                description: `Calculate r/r sum with potential R/R <strong>${selectedServerPotentialRewardToRisk}</strong>`
            })
        }

        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter, selectedServerIsExchangeData
        , selectedServerTotalCount, selectedServerRewardToRiskPure, selectedServerRewardToRiskSum
        , selectedServerRewardToRiskAvg, selectedServerWinRate, selectedServerCalculatedCommissionSum, selectedServerRewardToRiskTolerance, selectedServerPotentialRewardToRisk]);

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

    const loadData = async (interval) => {
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
            console.log(symbols);

        if (selectedServerStrategies && selectedServerStrategies.length > 0)
            strategies = selectedServerStrategies.join();
        if (selectedServerBacktests && selectedServerBacktests.length > 0)
            backtests = selectedServerBacktests.join();
        if (!interval && selectedServerInterval)
            interval = selectedServerInterval;

        scalpServices.getWatchList(strategies, backtests, symbols, interval, start, end, selectedServerIsRegisteredInMarket, selectedServerIsExchangeData
            , selectedServerTotalCount, selectedServerRewardToRiskPure, selectedServerRewardToRiskSum
            , selectedServerRewardToRiskAvg, selectedServerWinRate, selectedServerCalculatedCommissionSum, selectedServerReasonsToNotEnter
            , selectedServerRewardToRiskTolerance, selectedServerPotentialRewardToRisk).then(response => {
                let tempData = response.data?.watchList ? response.data?.watchList : response.data;
                if (response.data === null || response.data === 0) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: "No data found",
                        life: 6000
                    });
                    setLoading(false);
                    setData(null);
                }
                else {
                    setData(tempData);
                    setRows(tempData?.length ?? 10)
                    setFilteredData(response.data?.watchList);
                    setPositionsStartDate(response.data?.startDate);
                    setPositionsEndDate(response.data?.endDate);
                    setPositionsDuration(response.data?.duration);
                    setCurrentPositionsCount(response.data?.currentPositionsCount);
                    setLoading(false);
                }
            });
    }

    const columns = [
        {
            ...columnHelper.defaultColumn,
            field: "symbol",
            header: "Symbol",
            sortable: true,
            style: { 'minWidth': '50px', width: '140px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "totalCount",
            header: "Total Count",
            sortable: true,

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "winCount",
            header: "Win Count",
            sortable: true,

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "lossCount",
            header: "Loss Count",
            sortable: true,

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskAvg",
            header: "Wins R/R Avg",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "R/R Sum",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),

            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "commissionRSum",
        //     header: "Commission(R)",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     style: { 'minWidth': '50px', width: '120px' },
        //     bodyStyle: { justifyContent: 'center' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "rewardToRiskPure",
        //     header: "R/R Pure",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),

        //     style: { 'minWidth': '50px', width: '100px' },
        //     bodyStyle: { justifyContent: 'center' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "realCommissionSum",
        //     header: "Real Commission Sum",
        //     sortable: true,
        //     bodyStyle: { justifyContent: 'center' },

        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     style: { 'minWidth': '50px', width: '100px' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "calculatedCommissionSum",
        //     header: "Calculated Commission Sum",
        //     sortable: true,

        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     bodyStyle: { justifyContent: 'center' },

        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeTotalCount",
        //     header: "Exchange Total Count",
        //     sortable: true,
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinCount",
        //     header: "Exchange Win Count",
        //     sortable: true,
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeLossCount",
        //     header: "Exchange Loss Count",
        //     sortable: true,
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeWinRatio",
        //     header: "Exchange Win Ratio",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeRewardToRiskAvg",
        //     header: "Exchange R/R Avg",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },

        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeRewardToRiskSum",
        //     header: "Exchange R/R Sum",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCommissionRSum",
        //     header: "Exchange Commission(R)",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "exchange-col",
        //     style: { 'minWidth': '50px', width: '120px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeRewardToRiskPure",
        //     header: "Exchange R/R Pure",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     className: "exchange-col",

        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' },
        //     bodyStyle: { justifyContent: 'center' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "exchangeCommissionSum",
        //     header: "Exchange Commission Sum",
        //     sortable: true,
        //     bodyStyle: { justifyContent: 'center' },
        //     className: "exchange-col",

        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     style: { 'minWidth': '50px', width: '100px', backgroundColor: '#e4e4e5' }
        // },
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
            name: "totalCount",
            label: "Min Total Count",
            type: FilterType.Number,
            state: selectedServerTotalCount,
            setState: setSelectedServerTotalCount
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "rewardToRiskPure",
        //     label: "Min R/R Pure",
        //     type: FilterType.Decimal,
        //     state: selectedServerRewardToRiskPure,
        //     setState: setSelectedServerRewardToRiskPure
        // },
        {
            name: "rewardToRiskSum",
            label: "Min R/R Sum",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskSum,
            setState: setSelectedServerRewardToRiskSum
        },
        {
            name: "rewardToRiskAvg",
            label: "Min R/R Avg",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskAvg,
            setState: setSelectedServerRewardToRiskAvg
        },
        {
            name: "winRate",
            label: "Min Win Ratio (Percentage)",
            type: FilterType.Decimal,
            state: selectedServerWinRate,
            setState: setSelectedServerWinRate
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "calculatedCommissionSum",
        //     label: "Max Calculated Commission Sum",
        //     type: FilterType.Decimal,
        //     state: selectedServerCalculatedCommissionSum,
        //     setState: setSelectedServerCalculatedCommissionSum
        // },
    ]

    const header = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(data, "watch-list")} className="p-button-info" data-pr-tooltip="XLS" />
            <div className="filter-container">
                <span className="flex p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </span>
            </div>
            <ColumnManager columns={columns} dataTableName="dt-state-efficiency" setSortState={setMultiSortMeta}
                onSave={() => setData(prevState => [...prevState])} />
        </div>
    );

    return (
        <div id="symbol-efficiency-report">
            <Toast ref={toast} />
            <Card style={{ width: '100%', marginBottom: '2em' }}>
                <div className="grid p-fluid">
                    <Tooltip target=".tltip" />
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
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter
                            onChange={onTimeFrameSelectChange} className="w-full align-self-end" />
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverPotentialRewardToRisk" className="align-self-baseline">Min Potential R/R</label>
                        <InputNumber id="serverPotentialRewardToRisk" value={selectedServerPotentialRewardToRisk} onValueChange={(e) => setSelectedServerPotentialRewardToRisk(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <Divider />
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Min Exchange Total Count'} data-pr-position="top" data-pr-at="left+100 top-15" data-pr-my="left center-2"> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip">
                        <label htmlFor="serverTotalCount" className="align-self-baseline">Min Total Count</label>
                        <InputNumber id="serverTotalCount" value={selectedServerTotalCount} onValueChange={(e) => setSelectedServerTotalCount(e.value)}
                            showButtons className="w-full align-self-end" />
                    </div>
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Min Exchange R/R Pure'} data-pr-position="top" data-pr-at="left+100 top-15" data-pr-my="left center-2">
                        <label htmlFor="serverRewardToRiskPure" className="align-self-baseline">Min R/R Pure</label>
                        <InputNumber id="serverRewardToRiskPure" value={selectedServerRewardToRiskPure} onValueChange={(e) => setSelectedServerRewardToRiskPure(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div> */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Min Exchange R/R Sum'} data-pr-position="top" data-pr-at="left+100 top-15" data-pr-my="left center-2"> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip">
                        <label htmlFor="serverRewardToRiskSum">Min R/R Sum</label>
                        <InputNumber id="serverRewardToRiskSum" value={selectedServerRewardToRiskSum} onValueChange={(e) => setSelectedServerRewardToRiskSum(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div>
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Min Exchange R/R Avg'} data-pr-position="top" data-pr-at="left+100 top-15" data-pr-my="left center-2"> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip">
                        <label htmlFor="serverRewardToRiskAvg" className="align-self-baseline">Min R/R Avg</label>
                        <InputNumber id="serverRewardToRiskAvg" value={selectedServerRewardToRiskAvg} onValueChange={(e) => setSelectedServerRewardToRiskAvg(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div>
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Min Exchange Win Ratio'} data-pr-position="top" data-pr-at="left+100 top-15" data-pr-my="left center-2"> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip">
                        <label htmlFor="serverWinRate" className="align-self-baseline">Min Win Ratio (Percentage)</label>
                        <InputNumber id="serverWinRate" value={selectedServerWinRate} onValueChange={(e) => setSelectedServerWinRate(e.value)}
                            min={0} max={100} showButtons className="w-full align-self-end" />
                    </div>
                    {/* //DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap tltip"
                        data-pr-tooltip={'If \'Is Exchange Data?\' is equal to Yes. Converts to Max Exchange Commission Sum'} data-pr-position="top" data-pr-at="left+100 top-35" data-pr-my="left center-2">
                        <label htmlFor="serverCalculatedCommissionSum" className="align-self-baseline">Max Calculated Commission Sum</label>
                        <InputNumber id="serverCalculatedCommissionSum" value={selectedServerCalculatedCommissionSum} onValueChange={(e) => setSelectedServerCalculatedCommissionSum(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                    </div> */}
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-symbol-efficiency"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    {/* DELETED FOR CLIENT VERSION  */}
                    {/* <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions" value={totalPositionsCount} />
                    </div> */}
                    <div className="col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Count" value={currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={positionsStartDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={positionsEndDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Duration" value={positionsDuration} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={data} className={"p-datatable-sm"} scrollable
                    showGridlines scrollDirection="both"
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" rowClassName={() => { return { 'row-hover': true } }}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    onContextMenu={e => cm.current.show(e.originalEvent)}
                    cellClassName={(data, options) => options.field}
                    onValueChange={e => setFilteredData(e)}>

                    {columnHelper.generatColumns(columns, "dt-state-efficiency")}

                </DataTable>
            </div>
        </div>);
}

export default SymbolEfficiencyReport;