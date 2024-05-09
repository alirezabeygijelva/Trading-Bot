import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { InputMask } from 'primereact/inputmask';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { scalpServices } from '../../services/ScalpServices';
import { columnHelper } from '../../utils/ColumnHelper';
import { templates } from '../../utils/Templates';
import Export from '../../components/Export';
import LabelWithValue from '../LabelWithValue';
import ColumnManager from '../../components/ColumnManager';
import { Tooltip } from 'primereact/tooltip';
import { exchangeServices } from '../../services/ExchangeServices';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import FiltersStatement from '../FiltersStatement';
import { IntervalHelper } from '../../utils/IntervalHelper';
import { Toast } from 'primereact/toast';
import { Tooltip as ReactTooltip, TooltipWrapper } from 'react-tooltip';
import tooltipImage from '../../assets/images/Elongation.png';
import { Image } from 'primereact/image';

//REPORT 3 (Analytical)
const ProperElongationReport = () => {
    const state = window.localStorage.getItem("server-filters-elongationreport");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const dt = useRef(null);
    const interval = React.useRef(null);
    const toast = React.useRef(null);
    const [token, setToken] = React.useState(0);
    const cm = useRef(null);
    const [loading, setLoading] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [reportData, setReportData] = useState({});
    const [symbols, setSymbols] = useState(filtersDefValue.symbol ?? []);
    const [exchangeSymbols, setExchangeSymbols] = useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = useState(filtersDefValue.timeFrame);
    const [selectedServerStartDate, setSelectedServerStartDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerRewardToRiskRange, setSelectedServerRewardToRiskRange] = React.useState(filtersDefValue.rewardToRiskRange ?? "1-10");
    const [selectedServerRewardToRiskStep, setSelectedServerRewardToRiskStep] = React.useState(filtersDefValue.rewardToRiskStep ?? 0.5);
    const [selectedServerMinPercentageOfPeriod, setSelectedServerMinPercentageOfPeriod] = React.useState(filtersDefValue.minPercentageOfPeriod);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [multiSortMeta, setMultiSortMeta] = useState([]);

    const menuModel = [
        {
            label: 'Copy Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent?.innerText)
        }
    ];

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];
    const [allFiltersData, setAllFiltersData] = useState([])
    const [defaultSymbols, setDefaultSymbols] = React.useState();
    const [intervals, setIntervals] = useState(IntervalHelper.intervalsList());
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
            name: "Dynamic R/R: ",
            description: `Get positions data based on these reward to risks: Range <strong>${selectedServerRewardToRiskRange === "" ? "1-10" : selectedServerRewardToRiskRange}</strong>`
                + ` (step: <strong>${selectedServerRewardToRiskStep ?? 0.5}</strong>)`
        })
        if (selectedServerRewardToRiskTolerance) {
            filtersStatement.push({
                name: "R/R Tolerance: ",
                description: `Calculate r/r sum with telorance <strong>${selectedServerRewardToRiskTolerance}</strong>`
            })
        }
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter
        , selectedServerRewardToRiskRange, selectedServerRewardToRiskStep]);

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

    useEffect(() => {
        var tokenVal = "";
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            var character = characters.charAt(Math.floor(Math.random() * charactersLength));
            var number = Math.floor(Math.random() * 101);
            var number2 = Math.floor(Math.random() * 100) + 50;
            tokenVal += `${number2}${character}$${number}`
        }
        setToken(tokenVal);

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
        if (!selectedServerMinPercentageOfPeriod) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: "Please enter 'Time Span'.",
            });
            return;
        }

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

        scalpServices.getProperElongationReport(strategies, backtests, symbols, selectedServerInterval, start, end
            , selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter, selectedServerRewardToRiskRange, selectedServerRewardToRiskStep
            , selectedServerMinPercentageOfPeriod, token, selectedServerRewardToRiskTolerance).then(data => {
                setTimeout(() => {
                    StartProgress();
                }, 2000)
            });
    }

    const StartProgress = () => {
        interval.current = setInterval(() => {
            scalpServices.getProgress(token).then(response => {
                if (interval.current === null)
                    return;
                if (response.isSuccess === true) {
                    if (response.data.isFinished && response.data.isFailed) {
                        clearInterval(interval.current);
                        interval.current = null;
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.data.message?.substring(0, 250),
                            life: 60000
                        });
                        setReportData({})
                        setLoading(false);
                    }

                    if (response.data.isFinished && response.data.progress === 1) {
                        clearInterval(interval.current);
                        interval.current = null;
                        setReportData(response.data?.responseData);
                        setLoading(false);
                        return false;
                    }
                }
                else {
                    clearInterval(interval.current);
                    interval.current = null;
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message?.substring(0, 250),
                        life: 60000
                    });
                    setReportData({})
                    setLoading(false);
                }
            });
        }, 1000);
    }

    const columns = [
        {
            ...columnHelper.defaultColumn,
            field: "slowCorrectionElongation",
            header: "Slow Correction Elongation",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "potentialRewardToRisk",
            header: "Potential R/R",
            sortable: true,
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "positionsCount",
            header: "Total Count",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winsCount",
            header: "Wins Count",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "lossesCount",
            header: "Losses Count",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "R/R Sum",
            sortable: true,
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '100px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "rewardToRiskPure",
        //     header: "Pure R/R Sum",
        //     sortable: true,
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     style: { 'minWidth': '50px', width: '100px' }
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
            name: "reasonsToNotEnter",
            label: "Reasons To Not Enter",
            type: FilterType.MultiSelect,
            options: reasonsToNotEnter,
            state: selectedServerReasonsToNotEnter,
            setState: setSelectedServerReasonsToNotEnter
        },
        {
            name: "rewardToRiskRange",
            label: "R/R Range",
            type: FilterType.Text,
            state: selectedServerRewardToRiskRange,
            setState: setSelectedServerRewardToRiskRange
        },
        {
            name: "rewardToRiskStep",
            label: "R/R Step",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskStep,
            setState: setSelectedServerRewardToRiskStep
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "minPercentageOfPeriod",
            label: "Time Span",
            type: FilterType.Number,
            state: selectedServerMinPercentageOfPeriod,
            setState: setSelectedServerMinPercentageOfPeriod
        },
    ]

    const header = (
        <div className="table-header-container align-items-baseline flex-wrap">
            <div className="table-header-container flex flex-wrap align-items-center">
                <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(reportData.bestValuesForProperElongation, "elongationreport")} className="p-button-info" data-pr-tooltip="XLS" />
                <ColumnManager columns={columns} dataTableName="dt-state-elongationreport" setSortState={setMultiSortMeta}
                    onSave={() => setReportData(prevState => ({ ...prevState }))} buttonClassNames="ml-auto" />
            </div>
        </div>
    );
    return (
        <div id="not-entered-position-container">
            <Toast ref={toast} />
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
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber id="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance} onValueChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    <div className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskRange" className="align-self-baseline">R/R Range</label>
                        <InputText id='serverRewardToRiskRange' value={selectedServerRewardToRiskRange} placeholder="Default: 1-10" keyfilter={new RegExp('[0-9-.,]+$')}
                            onChange={(e) => setSelectedServerRewardToRiskRange(e.target.value)} className="w-full align-self-end" />
                        <span className='hint-lable'>1-5 or 2,6,7 or 4</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskStep" className="align-self-baseline">R/R Step</label>
                        <InputNumber id="serverRewardToRiskStep" value={selectedServerRewardToRiskStep} onValueChange={(e) => setSelectedServerRewardToRiskStep(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" placeholder="Default: 0.5" />
                        <span className='empty-space'>.</span>
                    </div>
                    <ReactTooltip id="tooltip-pacepower" place="bottom" >
                        <div><Image src={tooltipImage} alt="stopParameters help" width='400' /></div>
                    </ReactTooltip>
                    <div className="col-12 md:col-6 lg:col-4 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-pacepower">
                            <label htmlFor="serverMinPercentageOfPeriod" className="align-self-baseline">Time Span*</label>
                            <InputNumber id="serverMinPercentageOfPeriod" value={selectedServerMinPercentageOfPeriod} onValueChange={(e) => setSelectedServerMinPercentageOfPeriod(e.value)}
                                showButtons className="w-full align-self-end" placeholder="Please enter a value" />
                            <span className='empty-space'>.</span>
                        </TooltipWrapper>
                    </div>

                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Run" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-caret-right" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-elongationreport"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    {/* //DELETED FOR CLIENT VERSION  */}
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
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <div className="card">
                <DataTable ref={dt} value={reportData.bestValuesForProperElongation} className={"p-datatable-sm"} scrollable
                    showGridlines scrollDirection="both"
                    loading={loading} header={header} scrollHeight="550px"
                    contextMenuSelection={selectedContent} sortMode="multiple"
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    cellClassName={(data, options) => options.field}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-elongationreport")}

                </DataTable>
            </div>
        </div>
    );
}
export default ProperElongationReport

