import React, { useRef } from 'react';
import moment from 'moment';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { dateHelper } from '../../utils/DateHelper';
import { scalpServices } from '../../services/ScalpServices';
import { Tooltip } from 'primereact/tooltip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Messages } from 'primereact/messages';
import { exchangeServices } from '../../services/ExchangeServices';
import { FilterType } from '../../utils/FilterType';
import { contentHelper } from '../../utils/ContentHelper';
import { Role } from '../../utils/Role';
import { accountServices } from '../../services/AccountServices';
import FilterManager from '../FilterManager';
import FiltersStatement from '../FiltersStatement';
import LabelWithValue from '../LabelWithValue';
import useTranslation from '../../lib/localization';
import '../../assets/scss/PureRewardToRiskDailyReport.scss';
import { IntervalHelper } from '../../utils/IntervalHelper';
import { InputNumber } from 'primereact/inputnumber';

//REPORT 12 (Statistical)
const PureRewardToRiskDailyReport = (props) => {
    const t = useTranslation();
    const state = window.localStorage.getItem("server-filters-daily-report");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const [loading, setLoading] = React.useState(false);
    const [reportData, setReportData] = React.useState({});
    const [symbols, setSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerIsExchangeData, setSelectedServerIsExchangeData] = React.useState(filtersDefValue.isExchangeData);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerPotentialRewardToRisk, setSelectedServerPotentialRewardToRisk] = React.useState();
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const msgs = useRef(null);
    const [hasError, setHasError] = React.useState(false);
    const rolePlan1 = React.useRef(accountServices.currentUserRoles.includes(Role.Plan1));

    const booleanSelection = [
        { label: t("booleanSelection.yes"), value: 'true' },
        { label: t("booleanSelection.no"), value: 'false' }
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
                name: t("report12.strategies"),
                description: (selectedServerStrategies.length === 1
                    ? `${t("report12.filtersStatement.strategyDesOne")}<strong>${strategies.find(x => x.value === selectedServerStrategies[0])?.label ?? ""}</strong>`
                    : `${t("report12.filtersStatement.strategyDesTwo")}<strong>${selectedServerStrategies.length}</strong>${t("report12.filtersStatement.strategyDesThree")}`)
            })
        }
        if (selectedServerBacktests && selectedServerBacktests.length !== 0) {
            filtersStatement.push({
                name: t("report12.backtests"),
                description: (selectedServerBacktests.length === 1
                    ? `${t("report12.filtersStatement.backtestDesOne")}<strong>${backtests.find(x => x.value === selectedServerBacktests[0])?.label ?? ""}</strong>`
                    : `${t("report12.filtersStatement.backtestDesTwo")}<strong>${selectedServerBacktests.length}</strong>${t("report12.filtersStatement.backtestDesThree")}`)
            })
        }
        if (selectedServerSymbols && selectedServerSymbols.length !== 0) {
            filtersStatement.push({
                name: t("report12.filtersStatement.symbols"),
                description: (selectedServerSymbols.length === 1
                    ? `${t("report12.filtersStatement.symbolsDesOne")}<strong>${selectedServerSymbols}</strong>`
                    : `${t("report12.filtersStatement.symbolsDesTwo")}<strong>${selectedServerSymbols.length}</strong>${t("report12.filtersStatement.symbolsDesThree")}`)
            })
        }
        if (selectedServerInterval) {
            filtersStatement.push({
                name: t("report12.filtersStatement.timeFrame"),
                description: `${t("report12.filtersStatement.timeFrameDes")}<strong>${selectedServerInterval}</strong>`
            })
        }
        if (selectedServerIsRegisteredInMarket) {
            filtersStatement.push({
                name: t("report12.filtersStatement.registerInMarket"),
                description: (selectedServerIsRegisteredInMarket === 'true'
                    ? `${t("report12.filtersStatement.isRegisterInMarketDesOne")}<strong>${t("report12.filtersStatement.isRegisterInMarketDesTwo")}</strong>${t("report12.filtersStatement.isRegisterInMarketDesThree")}`
                    : `${t("report12.filtersStatement.isRegisterInMarketDesOne")}<strong>${t("report12.filtersStatement.isRegisterInMarketDesFour")}</strong>${t("report12.filtersStatement.isRegisterInMarketDesThree")}`)
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
                name: t("report12.filtersStatement.dateAndTime"),
                description: `${t("report12.filtersStatement.dateAndTimeDesOne")}<strong>${selectedServerStartDate.toString().split('+')[0]}</strong> `
                    + `${t("report12.filtersStatement.dateAndTimeDesTwo")}<strong>${selectedServerEndDate.toString().split('+')[0]}</strong>`
            })
        }
        if (selectedServerReasonsToNotEnter && selectedServerReasonsToNotEnter.length !== 0) {
            filtersStatement.push({
                name: t("report12.filtersStatement.reasonToNotEnter"),
                description: (selectedServerReasonsToNotEnter.length === 1
                    ? `${t("report12.filtersStatement.reasonToNotEnterDesOne")}'<strong>${selectedServerReasonsToNotEnter}</strong>'`
                    : `${t("report12.filtersStatement.reasonToNotEnterDesTwo")}<strong>${selectedServerReasonsToNotEnter.length}</strong>${t("report12.filtersStatement.reasonToNotEnterDesThree")}`)
            })
        }
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
        //DELETED FOR CLIENT VERSION
        // filtersStatement.push({
        //     name: t("report12.filtersStatement.isExchangeData"),
        //     description: (selectedServerIsExchangeData === 'true'
        //         ? `${t("report12.filtersStatement.isExchangeDataDesOne")}`
        //         : `${t("report12.filtersStatement.isExchangeDataDesTwo")}`)
        // })
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerReasonsToNotEnter, selectedServerIsExchangeData, selectedServerIsRegisteredInMarket
        , selectedServerRewardToRiskTolerance , selectedServerPotentialRewardToRisk]);

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
        if (props.isDashboard) {
            setLoading(true);
            scalpServices.getPureRewardToRiskDailyReport([], [], symbols, selectedServerInterval, null, null
                , selectedServerIsExchangeData, selectedServerReasonsToNotEnter, selectedServerIsRegisteredInMarket, props.isDashboard).then(response => {
                    if (response.isSucceed) {
                        setReportData(response.data);
                    }
                    else {
                        setHasError(true);
                        msgs.current.show([
                            { severity: 'error', detail: response.message ?? t("report12.errorMessage"), sticky: true, closable: false }
                        ]);
                    }
                    setLoading(false);
                });
        }
        else {
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
                if (filtersDefValue.filterStrategyType === t("report12.strategy") && data.length >= (filtersDefValue.strategies ?? 1)) {
                    var strategies = data[(filtersDefValue.strategies ?? 1) - 1].value;
                    setSelectedServerStrategies([strategies]);
                }
            });
            scalpServices.getBacktestsDropDown().then(data => {
                setBacktests(data);
                if (filtersDefValue.filterStrategyType === t("report12.backtest") && data.length >= (filtersDefValue.backtests ?? 1)) {
                    var backtests = data[(filtersDefValue.backtests ?? 1) - 1].value;
                    setSelectedServerBacktests([backtests]);
                }
            });
        }
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

        scalpServices.getPureRewardToRiskDailyReport(strategies, backtests, symbols, selectedServerInterval, start, end
            , selectedServerIsExchangeData, selectedServerReasonsToNotEnter, selectedServerIsRegisteredInMarket
            , false, selectedServerRewardToRiskTolerance , selectedServerPotentialRewardToRisk).then(response => {
                if (response.isSucceed) {
                    setReportData(response.data);
                }
                else {
                    setHasError(true);
                    msgs.current.clear();
                    msgs.current.show([
                        { severity: 'error', detail: response.message ?? t("report12.errorMessage"), sticky: true, closable: false }
                    ]);
                }
                setLoading(false);
            });
    }

    const renderTbody = () => {
        let days = [];
        for (let index = 1; index <= 31; index++) {
            days.push(index);
        }
        return days.map((day, index) =>
            <tr key={`tbody-day-${index}`}>
                <th style={{ backgroundColor: "#fdfddb" }}>{day}</th>
                {
                    //DELETED FOR CLIENT VERSION
                    // props.isDashboard ? reportData.monthsOfYears && reportData.monthsOfYears.map((x) => {
                    //     var pureRewardToRiskDollar = reportData.dailyWinRatios?.find(m => m.year === x.year && m.month === x.month && m.day === day)?.pureRewardToRiskDollar;
                    //     var formatedValue = pureRewardToRiskDollar ? "$" + contentHelper.digitFormat(pureRewardToRiskDollar, 2) : "";
                    //     var isExtraDay = reportData.extraDays.some(m => m.year === x.year && m.month === x.month && m.day === day);
                    //     var cellColor = pureRewardToRiskDollar ? (pureRewardToRiskDollar < 0 ? "white" : "lightgreen") : (pureRewardToRiskDollar == null && isExtraDay ? "#979796" : "#F1F1F1");
                    //     return (<td style={{ backgroundColor: cellColor }} title={pureRewardToRiskDollar == null && isExtraDay ? `${x.monthName}, ${x.year}` : `${x.monthName} ${day}, ${x.year}`} >{formatedValue}</td>)
                    // })
                    //     : reportData.monthsOfYears && reportData.monthsOfYears.map(x => {
                    //         var pureRewardToRisk = reportData.dailyWinRatios?.find(m => m.year === x.year && m.month === x.month && m.day === day)?.pureRewardToRisk;
                    //         var formatedValue = pureRewardToRisk ? contentHelper.digitFormat(pureRewardToRisk, 2) + "R" : "";
                    //         var isExtraDay = reportData.extraDays.some(m => m.year === x.year && m.month === x.month && m.day === day);
                    //         var cellColor = pureRewardToRisk ? (pureRewardToRisk < 0 ? "white" : "lightgreen") : (pureRewardToRisk == null && isExtraDay ? "#979796" : "#F1F1F1");
                    //         return (<td style={{ backgroundColor: cellColor }} title={pureRewardToRisk == null && isExtraDay ? `${x.monthName}, ${x.year}` : `${x.monthName} ${day}, ${x.year}`} >{formatedValue}</td>)
                    //     })
                    props.isDashboard ? reportData.monthsOfYears && reportData.monthsOfYears.map((x) => {
                        var rewardToRiskDollarSum = reportData.dailyWinRatios?.find(m => m.year === x.year && m.month === x.month && m.day === day)?.ewardToRiskDollarSum;
                        var formatedValue = rewardToRiskDollarSum ? "$" + contentHelper.digitFormat(rewardToRiskDollarSum, 2) : "";
                        var isExtraDay = reportData.extraDays.some(m => m.year === x.year && m.month === x.month && m.day === day);
                        var cellColor = rewardToRiskDollarSum ? (rewardToRiskDollarSum < 0 ? "white" : "lightgreen") : (rewardToRiskDollarSum == null && isExtraDay ? "#979796" : "#F1F1F1");
                        return (<td style={{ backgroundColor: cellColor }} title={rewardToRiskDollarSum == null && isExtraDay ? `${x.monthName}, ${x.year}` : `${x.monthName} ${day}, ${x.year}`} >{formatedValue}</td>)
                    })
                        : reportData.monthsOfYears && reportData.monthsOfYears.map(x => {
                            var rewardToRiskSum = reportData.dailyWinRatios?.find(m => m.year === x.year && m.month === x.month && m.day === day)?.rewardToRiskSum;
                            var formatedValue = rewardToRiskSum ? contentHelper.digitFormat(rewardToRiskSum, 2) + "R" : "";
                            var isExtraDay = reportData.extraDays.some(m => m.year === x.year && m.month === x.month && m.day === day);
                            var cellColor = rewardToRiskSum ? (rewardToRiskSum < 0 ? "white" : "lightgreen") : (rewardToRiskSum == null && isExtraDay ? "#979796" : "#F1F1F1");
                            return (<td style={{ backgroundColor: cellColor }} title={rewardToRiskSum == null && isExtraDay ? `${x.monthName}, ${x.year}` : `${x.monthName} ${day}, ${x.year}`} >{formatedValue}</td>)
                        })
                }
            </tr>
        )
    }

    const serverCustomableFilters = [
        {
            name: "strategies",
            label: t("serverFilters.strategies"),
            type: FilterType.Couter,
            options: strategies,
            state: selectedServerStrategies,
            setState: setSelectedServerStrategies
        },
        {
            name: "backtests",
            label: t("serverFilters.backtests"),
            type: FilterType.Couter,
            options: backtests,
            state: selectedServerBacktests,
            setState: setSelectedServerBacktests
        },
        {
            name: "symbol",
            label: t("serverFilters.symbols"),
            type: FilterType.MultiSelect,
            options: exchangeSymbols,
            state: selectedServerSymbols,
            setState: setSelectedServerSymbols
        },
        {
            name: "timeFrame",
            label: t("serverFilters.timeFrame"),
            type: FilterType.DropDown,
            options: intervals,
            state: selectedServerInterval,
            setState: setSelectedServerInterval
        },
        {
            name: "isRegisteredInMarket",
            label: t("serverFilters.isRegisterInMarket"),
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsRegisteredInMarket,
            setState: setSelectedServerIsRegisteredInMarket
        },
        {
            name: "startDate",
            label: t("serverFilters.fromDate"),
            type: FilterType.Date,
            state: selectedServerStartDate,
            setState: setSelectedServerStartDate
        },
        {
            name: "startTime",
            label: t("serverFilters.fromTime"),
            type: FilterType.Time,
            state: selectedServerStartTime,
            setState: setSelectedServerStartTime
        },
        {
            name: "endDate",
            label: t("serverFilters.toDate"),
            type: FilterType.Date,
            state: selectedServerEndDate,
            setState: setSelectedServerEndDate
        },
        {
            name: "endTime",
            label: t("serverFilters.toTime"),
            type: FilterType.Time,
            state: selectedServerEndTime,
            setState: setSelectedServerEndTime
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     name: "isExchangeData",
        //     label: t("serverFilters.isExchangeData"),
        //     type: FilterType.DropDown,
        //     options: booleanSelection,
        //     state: selectedServerIsExchangeData,
        //     setState: setSelectedServerIsExchangeData
        // },
        {
            name: "reasonsToNotEnter",
            label: t("serverFilters.reasonToNotEnter"),
            type: FilterType.MultiSelect,
            options: reasonsToNotEnter,
            state: selectedServerReasonsToNotEnter,
            setState: setSelectedServerReasonsToNotEnter
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
    ]

    return (
        <React.Fragment>
            <div id="dailyWinRatio-report-card">
                {!props.isDashboard && <Card style={{ width: '100%', marginBottom: '2em' }}>
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverStrategy" className="align-self-baseline">{t("serverFilters.strategies")}</label>
                            <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                                onChange={onSelectStrategyChange} onHide={onSelectStrategyHide} placeholder={t("serverFilters.strategiesPlaceholder")} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverBacktests" className="align-self-baseline">{t("serverFilters.backtests")}</label>
                            <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                                onChange={onSelectBackTestChange} onHide={onSelectBackTestHide} placeholder={t("serverFilters.backtestsPlaceholder")} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverInterval" className="align-self-baseline">{t("serverFilters.timeFrame")}</label>
                            <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                                onChange={onTimeFrameSelectChange} placeholder={t("serverFilters.timeFramePlaceholder")} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverSymbol" className="align-self-baseline">{t("serverFilters.symbols")}</label>
                            <div className="w-full flex align-self-end">
                                <MultiSelect id='serverSymbol' value={selectedServerSymbols} options={symbols} filter showClear
                                    onChange={(e) => setSelectedServerSymbols(e.value)} placeholder={t("serverFilters.symbolsPlaceholder")} className="w-full align-self-end" />
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverStartDate" className="align-self-baseline">{t("serverFilters.fromDate")}</label>
                            <Calendar id="serverStartDate" value={selectedServerStartDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                                onChange={(e) => setSelectedServerStartDate(e.value)} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverStartTime" className="align-self-baseline">{t("serverFilters.fromTime")}</label>
                            <InputMask mask="99:99:99" value={selectedServerStartTime}
                                onChange={(e) => setSelectedServerStartTime(e.value)} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverEndDate" className="align-self-baseline">{t("serverFilters.toDate")}</label>
                            <Calendar id="serverEndDate" value={selectedServerEndDate} showIcon showButtonBar dateFormat="dd/mm/yy"
                                onChange={(e) => setSelectedServerEndDate(e.value)} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverEndTime" className="align-self-baseline">{t("serverFilters.toTime")}</label>
                            <InputMask mask="99:99:99" value={selectedServerEndTime}
                                onChange={(e) => setSelectedServerEndTime(e.value)} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">{t("serverFilters.isRegisterInMarket")}</label>
                            <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} showClear
                                onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder={t("serverFilters.isRegisterInMarketPlaceholder")} className="w-full align-self-end" />
                        </div>
                        <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                            <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">{t("serverFilters.reasonToNotEnter")}</label>
                            <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                                onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder={t("serverFilters.reasonToNotEnterPlaceholder")} className="w-full align-self-end" />
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
                            <label htmlFor="serverIsExchangeData" className="align-self-baseline">{t("serverFilters.isExchangeData")}</label>
                            <Dropdown id='serverIsExchangeData' value={selectedServerIsExchangeData} options={booleanSelection} filter showClear
                                onChange={(e) => setSelectedServerIsExchangeData(e.value)} placeholder={t("serverFilters.isExchangeDataPlaceholder")} className="w-full align-self-end" />
                        </div> */}

                        <div className="p-field col-12 md:col-12 flex">
                            <Button type="button" label={t("shared.search")} className="p-button-raised ml-auto" loading={loading}
                                icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                            {!rolePlan1 &&
                                <FilterManager filters={serverCustomableFilters} stateName="server-filters-daily-report" onSave={loadData} />}
                        </div>
                        <FiltersStatement commonFiltersStatement={filterStatement} />
                    </div>
                </Card>}

                {hasError && <Messages ref={msgs} />}
                {loading && props.isDashboard && <div className="w-full text-center"><ProgressSpinner /></div>}
                {!hasError && !loading && <React.Fragment>
                    <Card style={{ width: '100%', marginBottom: '1em' }}>
                        <Tooltip target=".tltip" mouseTrack mouseTrackLeft={50} />
                        <div className="grid p-fluid flex-1 flex-wrap">
                            {/* DELETED FOR CLIENT VERSION  */}
                            {/* <div className="col-12 md:col-6 lg:col-4">
                                <LabelWithValue className="p-inputgroup" displayText={t("report12.totalPositions")} value={reportData.totalPositionsCount} />
                            </div> */}
                            {!props.isDashboard && <div className="col-12">
                                <LabelWithValue className="p-inputgroup" displayText={t("report12.currentPositions")} value={reportData.currentPositionsCount} />
                            </div>}
                            <div className="col-12 md:col-6 lg:col-4">
                                <LabelWithValue className="p-inputgroup" displayText={t("report12.startDate")} value={reportData.startDate} />
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <LabelWithValue className="p-inputgroup" displayText={t("report12.endDate")} value={reportData.endDate} />
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <LabelWithValue className="p-inputgroup" displayText={t("report12.positionsDuration")} value={reportData.duration} />
                            </div>
                        </div>
                    </Card>
                    <Card style={{ width: '100%', marginBottom: '1em' }}>
                        <div className="dailyWinRatio-report-card">
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2" style={{ backgroundColor: "#fdfddb" }}>{t("report12.day")}</th>
                                        {reportData.monthsOfYears && reportData.monthsOfYears.map((item) => {
                                            return (<td>{item.year}</td>)
                                        })
                                        }
                                    </tr>
                                    <tr style={{ backgroundColor: "#fdfddb" }}>
                                        {reportData.monthsOfYears && reportData.monthsOfYears.map((item) => {
                                            return (<th>{item.monthName}</th>)
                                        })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTbody()}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: "#E88503", color: "#ffffff" }}>
                                        <th>{t("report12.total")}</th>
                                        {props.isDashboard ? reportData.summary && reportData.summary.map((item) => {
                                            return (<th title={`${item.monthName}, ${item.year}`} style={(item.totalDollar > 0 ? { color: "lightgreen" } : { color: "#ffffff" })} >
                                                {item.totalDollar ? "$" + contentHelper.digitFormat(item.totalDollar, 2) : ""}</th>)
                                        })
                                            : reportData.summary && reportData.summary.map((item) => {
                                                return (<th title={`${item.monthName}, ${item.year}`} style={(item.total > 0 ? { color: "lightgreen" } : { color: "#ffffff" })} >

                                                    {item.total ? contentHelper.digitFormat(item.total, 2) + "R" : ""}</th>)
                                            })
                                        }
                                    </tr>
                                    {!props.isDashboard && <tr>
                                        <th>{t("report12.average")}</th>
                                        {reportData.summary && reportData.summary.map((item) => {
                                            return (<td title={`${item.monthName}, ${item.year}`}>{item.average ? contentHelper.digitFormat(item.average, 2) + "R" : ""}</td>)
                                        })
                                        }
                                    </tr>}
                                    <tr>
                                        <th>{t("report12.trades")}</th>
                                        {reportData.summary && reportData.summary.map((item) => {
                                            return (<td title={`${item.monthName}, ${item.year}`}>{item.trades}</td>)
                                        })
                                        }
                                    </tr>
                                    {!props.isDashboard && <tr>
                                        <th>{t("report12.wins")}</th>
                                        {reportData.summary && reportData.summary.map((item) => {
                                            return (<td title={`${item.monthName}, ${item.year}`}>{item.winsCount}</td>)
                                        })
                                        }
                                    </tr>}
                                    {!props.isDashboard && <tr>
                                        <th>{t("report12.losses")}</th>
                                        {reportData.summary && reportData.summary.map((item) => {
                                            return (<td title={`${item.monthName}, ${item.year}`}>{item.lossesCount}</td>)
                                        })
                                        }
                                    </tr>}
                                </tfoot>
                            </table>
                            <div className="col-12 justify-content-center" style={{ display: "grid" }}>
                                <LabelWithValue className="p-inputgroup mt-3" displayText="Reward To Risk Sum"
                                    value={props.isDashboard ? "$" + contentHelper.digitFormat(reportData?.summary?.reduce((a, b) => a + b.totalDollar, 0) ?? 0, 2) : reportData.summary?.reduce((a, b) => a + b.total, 0)} />
                                {/* //DELETED FOR CLIENT VERSION */}
                                {/* <LabelWithValue className="p-inputgroup mt-3" displayText={props.isDashboard ? t("report12.sum") : t("report12.pureR/RSum")}
                                    value={props.isDashboard ? "$" + contentHelper.digitFormat(reportData?.summary?.reduce((a, b) => a + b.totalDollar, 0) ?? 0, 2) : reportData.summary?.reduce((a, b) => a + b.total, 0)} /> */}
                            </div>
                        </div>
                    </Card></React.Fragment>}
            </div>
        </React.Fragment>
    );
}
export default PureRewardToRiskDailyReport

