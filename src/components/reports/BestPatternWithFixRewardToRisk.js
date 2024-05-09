import React, { useRef, useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { templates } from '../../utils/Templates';
import { columnHelper } from '../../utils/ColumnHelper';
import Export from '../../components/Export';
import ColumnManager from '../../components/ColumnManager';
import LabelWithValue from '../LabelWithValue';
import FilterManager from '../FilterManager';
import { FilterType } from '../../utils/FilterType';
import { Toast } from 'primereact/toast';
import { InputSwitch } from 'primereact/inputswitch';
import { exchangeServices } from '../../services/ExchangeServices';
import { ProgressBar } from 'primereact/progressbar';
import '../../assets/scss/RefCandlePatternReport.scss';
import FiltersStatement from '../FiltersStatement';
import PositionTable from '../PositionTable';
import { filterHelper } from '../../utils/FilterHelper';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { Ripple } from 'primereact/ripple';
import { IntervalHelper } from '../../utils/IntervalHelper';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';
import { Tooltip, TooltipWrapper } from 'react-tooltip'
import tooltipImage from '../../assets/images/PLOTPATTERN.jpg';
import Paginator from '../Paginator';

const BestPatternWithFixRewardToRisk = () => {
    const state = window.localStorage.getItem("server-filters-pattern-report-withfixrr");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const interval = useRef(null);
    const [statusForBestPatternWithFixRR, setStatusForBestPatternWithFixRR] = React.useState(null);
    const [progressValueForBestPatternWithFixRR, setProgressValueForBestPatternWithFixRR] = React.useState(0);
    const [progressModeForBestPatternWithFixRR, setProgressModeForBestPatternWithFixRR] = React.useState('determinate');
    const dt = useRef(null);
    const cm = React.useRef(null);
    const toast = React.useRef(null);
    const [positions, setPositions] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);

    const [loading, setLoading] = React.useState(false);
    const [loadingForBestPatternWithFixRR, setLoadingForBestPatternWithFixRR] = React.useState(false);

    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerIsPinBar, setSelectedServerIsPinBar] = React.useState(filtersDefValue.isPinBar);
    const [selectedServerIsSucceed, setSelectedServerIsSucceed] = React.useState(filtersDefValue.isSucceed);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    //DELETED FOR CLIENT VERSION
    // const [selectedServerLowerTimeFrameDivergenceIn, setSelectedServerLowerTimeFrameDivergenceIn] = React.useState(filtersDefValue.lowerTimeFrameDivergenceIn);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerRefCandleBodyRatio, setSelectedServerRefCandleBodyRatio] = React.useState(filtersDefValue.refCandleBodyRatio);
    const [selectedServerRefCandleShadowsDifference, setSelectedServerRefCandleShadowsDifference] = React.useState(filtersDefValue.refCandleShadowsDifference);
    const [selectedServerRewardToRisk, setSelectedServerRewardToRisk] = React.useState(filtersDefValue.rewardToRisk ?? 1);
    const [selectedServerRegressionTolerance, setSelectedServerRegressionTolerance] = React.useState(filtersDefValue.regressionTolerance ?? 0.5);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerMinWinRatio, setSelectedServerMinWinRatio] = React.useState(filtersDefValue.minWinRatio);
    const [selectedServerIncludePositions, setSelectedServerIncludePositions] = React.useState(filtersDefValue.includePositions ?? true);
    const [symbols, setSymbols] = React.useState([]);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [summaryData, setSummaryData] = React.useState([]);
    const [bestPatternFixRewardToRiskData, setBestPatternFixRewardToRiskData] = React.useState({});
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [duration, setDuration] = React.useState('');
    const [token, setToken] = React.useState(0);
    const [commonFilterStatement, setCommonFilterStatement] = React.useState([]);
    const [bestPatternWithFixRewardToRiskStatement, setBestPatternWithFixRewardToRiskStatement] = React.useState([]);
    const [currentDataTable, setCurrentDataTable] = React.useState(null);
    const [currentDataTableName, setCurrentDataTableName] = React.useState(null);
    const [bestPatternFixRewardToRiskTotalRows, setBestPatternFixRewardToRiskTotalRows] = React.useState(0);
    const bestPatternWithFixRRPg = useRef(null);
    const [bestPatternWithFixRRFirst, setBestPatternWithFixRRFirst] = useState(0);
    const [bestPatternWithFixRRRows, setBestPatternWithFixRRRows] = useState(10);

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const pinBarSelection = [
        { label: 'True', value: 'true' },
        { label: 'Reverse', value: 'false' }
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
    //DELETED FOR CLIENT VERSION
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
        var tokenVal = "";
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            var character = characters.charAt(Math.floor(Math.random() * charactersLength));
            // var charCode=Math.floor(Math.random() * 100) + 33;
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

    React.useEffect(() => {
        var filtersStatement = [];
        //#region Common Filters Statement
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
        if (selectedServerRefCandleBodyRatio) {
            filtersStatement.push({
                name: "Max RefCandle Body Ratio: ",
                description: `Get positions with less than or equal <strong>${selectedServerRefCandleBodyRatio}</strong> refCandle body ratio value`
            })
        }
        if (selectedServerRefCandleShadowsDifference) {
            filtersStatement.push({
                name: "Max RefCandle Shadows Difference: ",
                description: `Get positions with less than or equal <strong>${selectedServerRefCandleShadowsDifference}</strong> refCandle shadows difference value`
            })
        }
        if (selectedServerIsPinBar) {
            filtersStatement.push({
                name: "Has Pin Bar Pattern?: ",
                description: (selectedServerIsPinBar === 'true'
                    ? `Get long positions that lower shadow be larger than upper shadow and get short positions that upper shadow be larger than lower shadow`
                    : `Get long positions that lower shadow be smaller than upper shadow and get short positions that upper shadow be smaller than lower shadow`)
            })
        }
        if (selectedServerIsSucceed) {
            filtersStatement.push({
                name: "IsSucceed?: ",
                description: (selectedServerIsSucceed === 'true'
                    ? `Get wins positions based on min potential R/R (${selectedServerRewardToRisk ?? 0})`
                    : `Get losses positions based on min potential R/R (${selectedServerRewardToRisk ?? 0})`)
            })
        }
        //DELETED FOR CLIENT VERSION
        // if (selectedServerLowerTimeFrameDivergenceIn) {
        //     filtersStatement.push({
        //         name: "Lower Time Frame Divergence In: ",
        //         description: `Get positions that have lower time frame divergence in <strong>${lowerTimeFrameDivergenceSelection[selectedServerLowerTimeFrameDivergenceIn - 1].label}</strong>`
        //     })
        // }
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
        setCommonFilterStatement(filtersStatement);
        //#endregion

        filtersStatement = [];
        filtersStatement.push({
            name: "Min Potential R/R: ",
            description: `Positions with potential reward to risk of at least <strong>${selectedServerRewardToRisk ?? 0}</strong> are considered win `
                + `and their value of reward to risk is considered in calculations <strong>${selectedServerRewardToRisk ?? 0}</strong>, otherwise they are losers `
                + `and their value of reward to risk is considered -1`
        })
        setBestPatternWithFixRewardToRiskStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerRefCandleBodyRatio
        , selectedServerRefCandleShadowsDifference, selectedServerRewardToRisk, selectedServerIsPinBar
        , selectedServerIsSucceed, selectedServerRewardToRiskTolerance
        , selectedServerReasonsToNotEnter]);

    const loadData = async () => {
        setLoading(true);
        setLoadingForBestPatternWithFixRR(true);
        setProgressValueForBestPatternWithFixRR(0);
        setStatusForBestPatternWithFixRR('Loading...');

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

        scalpServices.getBestPatternSummaryReport(token, strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerRefCandleBodyRatio, selectedServerRefCandleShadowsDifference
            , selectedServerRewardToRisk, selectedServerIsPinBar, selectedServerIsSucceed
            , selectedServerIncludePositions, selectedServerReasonsToNotEnter
            , null, selectedServerRewardToRiskTolerance).then(response => {
                if (response.isSuccess === false) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message,
                    });
                    setPositions([]);
                    setSummaryData([]);
                    setStartDate('');
                    setEndDate('');
                    setDuration('');
                    setLoading(false);
                }
                else {
                    if (selectedServerIncludePositions)
                        setPositions(response.data.positions);
                    response.data.positions = null;
                    response.data.bestPatterns = null;
                    setSummaryData([response.data]);
                    setStartDate(response.data.startDate);
                    setEndDate(response.data.endDate);
                    setDuration(response.data.duration);
                    setLoading(false);
                }
            });

        scalpServices.getBestPatternWithFixRewardToRiskReport(token, strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerRefCandleBodyRatio, selectedServerRefCandleShadowsDifference
            , selectedServerRewardToRisk, selectedServerIsPinBar, selectedServerIsSucceed, selectedServerReasonsToNotEnter
            , null, selectedServerRegressionTolerance, selectedServerMinWinRatio, selectedServerRewardToRiskTolerance).then(() => {
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
                    if (response.data.total === -1) {
                        setProgressModeForBestPatternWithFixRR('indeterminate');
                    } else {
                        setProgressModeForBestPatternWithFixRR('determinate');
                    }
                    if (response.data.progress)
                        setProgressValueForBestPatternWithFixRR(response.data.progress * 100);

                    if (response.data.isFinished && response.data.isFailed) {
                        clearInterval(interval.current);
                        interval.current = null;
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.data.message,
                        });
                        setBestPatternFixRewardToRiskData({})
                        setLoadingForBestPatternWithFixRR(false);
                    }

                    if (response.data.isFinished && response.data.progress === 1) {
                        clearInterval(interval.current);
                        interval.current = null;
                        if (response.data.message) {
                            toast.current.show({
                                severity: 'warn',
                                detail: response.data.message,
                            });
                        }
                        setBestPatternFixRewardToRiskData(response.data?.responseData ?? {});
                        setBestPatternFixRewardToRiskTotalRows(response.data?.responseData?.bestPatterns?.length ?? 0);
                        setLoadingForBestPatternWithFixRR(false);
                        setStatusForBestPatternWithFixRR(response.data.status);
                        return false;
                    } else
                        setStatusForBestPatternWithFixRR(response.data.status);
                }
                else {
                    clearInterval(interval.current);
                    interval.current = null;
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message,
                    });
                    setBestPatternFixRewardToRiskData({})
                    setLoadingForBestPatternWithFixRR(false);
                }
            });
        }, 1000);
    }

    //#region filters
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = useState(null);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = useState(null);
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = useState(false);
    const [bestPatternWithFixRewardToRiskDTFilters, setBestPatternWithFixRewardToRiskDTFilters] = useState({});
    const [bestPatternWithFixRewardToRiskFilteredColumns, setBestPatternWithFixRewardToRiskFilteredColumns] = useState([]);
    const [numericColumnComparisonTypeWithFixRewardToRisk, setNumericColumnComparisonTypeWithFixRewardToRisk] = useState({
        refCandleBodyRatio: '',
        refCandleShadowsDifference: '',
        positionsCount: '',
        winsCount: '',
        lossesCount: '',
        winRatio: '',
        variance: '',
        rewardToRiskPure: '',
        rewardToRiskPureMarket: '',
        rewardToRisk: ''
    });

    const numericFilterType = [
        { label: 'Greater than', value: '>' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than', value: '<' },
        { label: 'Less than or equal to', value: '<=' },
        { label: 'equal', value: '===' },
        { label: 'Not equal', value: '!==' }
    ];

    const numericColumnComparisonTypeSetStates = {
        'WithFixRewardToRisk': setNumericColumnComparisonTypeWithFixRewardToRisk,
    }

    ///////////WithFixRewardToRisk
    const onNumericFilter = (type) => {
        var numericColumnComparisonType = null;
        // eslint-disable-next-line default-case
        switch (currentDataTableName) {
            case 'WithFixRewardToRisk':
                numericColumnComparisonType = numericColumnComparisonTypeWithFixRewardToRisk;
                break;
        }
        var temp = { ...numericColumnComparisonType };
        temp[displayNumericColumnFilter] = selectedNumericFilterType;
        numericColumnComparisonTypeSetStates[currentDataTableName](temp);

        currentDataTable.current.filter(selectedNumericFilterValue, displayNumericColumnFilter, 'custom');
        setSelectedNumericFilterValue(null);
        setSelectedNumericFilterType(null);
        onNumericFilterHide(type);
    }

    const onNumericFilterOpen = (name, type, table, tableName) => {
        setCurrentDataTableName(tableName);
        setCurrentDataTable(table);
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

    const onNumericFilterClear = (name, table, tableName) => {
        var numericColumnComparisonType = null;
        // eslint-disable-next-line default-case
        switch (tableName) {
            case 'WithFixRewardToRisk':
                numericColumnComparisonType = numericColumnComparisonTypeWithFixRewardToRisk;
                break;
        }
        var temp = { ...numericColumnComparisonType };
        temp[name] = '';
        numericColumnComparisonTypeSetStates[tableName](temp);

        table.current.filter(null, name, 'custom');
    }

    const renderFooter = (type) => {
        return (
            <div style={{ float: 'left' }}>
                <Button label="Filter" icon="pi pi-check" onClick={() => onNumericFilter(type)} autoFocus />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onNumericFilterHide(type)} className="p-button-text" />
            </div>
        )
    };

    const refCandleBodyRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleBodyRatio', 'decimal', dt, 'WithFixRewardToRisk')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleBodyRatio', dt, 'WithFixRewardToRisk')} />
        </span>
    const refCandleShadowsDifferenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleShadowsDifference', 'decimal', dt, 'WithFixRewardToRisk')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleShadowsDifference', dt, 'WithFixRewardToRisk')} />
        </span>
    const positionsCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('positionsCount', 'decimal', dt, 'WithFixRewardToRisk')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('positionsCount', dt, 'WithFixRewardToRisk')} />
        </span>
    const winRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatio', 'decimal', dt, 'WithFixRewardToRisk')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatio', dt, 'WithFixRewardToRisk')} />
        </span>
    const rewardToRiskPureFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskPure', 'decimal', dt, 'WithFixRewardToRisk')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskPure', dt, 'WithFixRewardToRisk')} />
        </span>

    const resetBestPatternWithFixRewardToRisk = (table) => {
        setNumericColumnComparisonTypeWithFixRewardToRisk({
            refCandleBodyRatio: '',
            refCandleShadowsDifference: '',
            positionsCount: '',
            winsCount: '',
            lossesCount: '',
            winRatio: '',
            variance: '',
            rewardToRiskPure: '',
            rewardToRiskPureMarket: '',
        });
        setBestPatternWithFixRewardToRiskFilteredColumns([]);
        setBestPatternWithFixRewardToRiskDTFilters([]);
        table.current.reset();
    }

    const onBestPatternWithFixRewardToRiskCustomFilter = (ev) => {
        setBestPatternWithFixRewardToRiskFilteredColumns(Object.keys(ev.filters));
        setBestPatternWithFixRewardToRiskDTFilters(ev.filters);
    }

    //#endregion

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
            name: "regressionTolerance",
            label: "Regression Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRegressionTolerance,
            setState: setSelectedServerRegressionTolerance
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "minWinRatio",
            label: "Min Win Ratio",
            type: FilterType.Decimal,
            state: selectedServerMinWinRatio,
            setState: setSelectedServerMinWinRatio
        },
        {
            name: "refCandleBodyRatio",
            label: "Max RefCandle Body Ratio",
            type: FilterType.Decimal,
            state: selectedServerRefCandleBodyRatio,
            setState: setSelectedServerRefCandleBodyRatio
        },
        {
            name: "refCandleShadowsDifference",
            label: "Max RefCandle Shadows Difference",
            type: FilterType.Decimal,
            state: selectedServerRefCandleShadowsDifference,
            setState: setSelectedServerRefCandleShadowsDifference
        },
        {
            name: "rewardToRisk",
            label: "Min Potential R/R",
            type: FilterType.Decimal,
            state: selectedServerRewardToRisk,
            setState: setSelectedServerRewardToRisk
        },
        {
            name: "isPinBar",
            label: "Candlestick Pattern Direction",
            type: FilterType.DropDown,
            options: pinBarSelection,
            state: selectedServerIsPinBar,
            setState: setSelectedServerIsPinBar
        },
        {
            name: "isSucceed",
            label: "Is Succeed?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsSucceed,
            setState: setSelectedServerIsSucceed
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
        //     name: "lowerTimeFrameDivergenceIn",
        //     label: "Lower Time Frame Divergence In",
        //     type: FilterType.DropDown,
        //     options: lowerTimeFrameDivergenceSelection,
        //     state: selectedServerLowerTimeFrameDivergenceIn,
        //     setState: setSelectedServerLowerTimeFrameDivergenceIn
        // },
        {
            name: "includePositions",
            label: "Include Positions Records",
            type: FilterType.Switch,
            state: selectedServerIncludePositions,
            setState: setSelectedServerIncludePositions
        },
    ]

    const summaryColumns = [
        {
            ...columnHelper.defaultColumn,
            field: "totalPositionsCount",
            header: "Total Positions Count",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "totalMarketPositionsCount",
            header: "Total Positions Count(Market)",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "currentPositionsCount",
            header: "Current Positions Count",
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRewardToRiskSum",
            header: "Wins Potential R/R Sum",
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRewardToRiskAvg",
            header: "Wins Potential R/R Avg",
            body: templates.digitBodyTemplate,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "Potential R/R Sum",
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "calculatedCommissionSum",
        //     header: "Calculated Commission Sum",
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
        //     bodyClassName: "text-center",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "rewardToRiskPure",
        //     header: "Min Potential Pure R/R Sum",
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
        //     bodyClassName: "text-center",
        //     style: { 'minWidth': '50px', width: '100px' }
        // },
    ]

    const patternsFixRewardToRiskColumns = [
        {
            ...columnHelper.defaultColumn,
            columnKey: "rowNumber",
            bodyClassName: "text-center",
            style: { 'minWidth': '25px', width: '50px' },
            body: (col, context) => context.rowIndex + 1,
            header: "#"
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleBodyRatio",
            header: "Max Body Ratio",
            sortable: true,
            filter: true,
            filterElement: refCandleBodyRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithFixRewardToRisk.refCandleBodyRatio),
            body: templates.digitBodyTemplate,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleShadowsDifference",
            header: "Max Shadows Difference",
            sortable: true,
            filter: true,
            filterElement: refCandleShadowsDifferenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithFixRewardToRisk.refCandleShadowsDifference),
            body: templates.digitBodyTemplate,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "positionsCount",
            header: "Total Count",
            sortable: true,
            filter: true,
            filterElement: positionsCountFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithFixRewardToRisk.positionsCount),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            filter: true,
            filterElement: winRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, 2))
                , filterValue, numericColumnComparisonTypeWithFixRewardToRisk.winRatio),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        //CHANGED FOR CLIENT VERSION
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "Min Potential R/R Sum",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskPureFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, columnValue > 1 ? 0 : 2))
                , filterValue, numericColumnComparisonTypeWithFixRewardToRisk.rewardToRiskPure),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
    ]

    const patternFixRewardToRiskHeader = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(bestPatternFixRewardToRiskData?.bestPatterns ?? [], "refCandlePatternBestPatternsFixRewardToRisk")} className="p-button-info" tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={() => resetBestPatternWithFixRewardToRisk(dt)} />
                <span className="flex p-input-icon-left">
                </span>
            </div>
        </div>
    );

    const bestPatternFixRewardToRiskFooter = (
        <div className="table-footer-container flex-wrap align-items-center">
            <LabelWithValue displayText="Total" value={bestPatternFixRewardToRiskTotalRows} />
            <div className='col-12 mt-3'>Best Patterns Calcaulated With REGRESSION:</div>
            <DataTable value={bestPatternFixRewardToRiskData?.regressionPatterns ?? []} className={"p-datatable-sm w-full mb-2"}
                showGridlines scrollDirection="both" scrollable
                contextMenuSelection={selectedContent} onContextMenuSelectionChange={e => setSelectedContent(e)} scrollHeight="200px"
                cellClassName={(data, options) => options.field} onContextMenu={e => cm.current.show(e.originalEvent)}>

                {columnHelper.generatColumns(patternsFixRewardToRiskColumns.map(prev => ({ ...prev, filter: false }))
                    , "dt-state-refCandle-pattern-regression-patterns-fixrr")}
            </DataTable>
        </div>
    );

    const summaryHeader = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(summaryData, "refCandlePatternSummary")} className="p-button-info" tooltip="XLS" />
            <div className="col-12 md:col-6 lg:col-3">
                <LabelWithValue className="p-inputgroup" displayText="Start Date" value={startDate} />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <LabelWithValue className="p-inputgroup" displayText="End Date" value={endDate} />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <LabelWithValue className="p-inputgroup" displayText="Duration" value={duration} />
            </div>
            <div className="filter-container"></div>
            <ColumnManager columns={summaryColumns} dataTableName="dt-state-refCandle-pattern-summary"
                onSave={() => setPositions(prevState => [...prevState])} />
        </div>
    );

    const colorizeRow = (rowData) => {
        if (rowData.registeredInMarket) {
            if (rowData.potentialRewardToRisk > (selectedServerRewardToRisk ?? 0))
                return { 'succeed': true }
            else if (rowData.potentialRewardToRisk < (selectedServerRewardToRisk ?? 0))
                return { 'failed': true }
        }
    }

    const displayValueTemplate = (value) => {
        return (
            <React.Fragment>
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%
            </React.Fragment>
        );
    }

    const templatePanel = (options) => {
        const toggleIcon = options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up';
        const className = `${options.className} justify-content-start`;
        const titleClassName = `${options.titleClassName} pl-1`;

        return (
            <div className={className}>
                <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <span className={toggleIcon}></span>
                    <Ripple />
                </button>
                <span className={titleClassName}>
                    Summary
                </span>
            </div>
        )
    }

    return (
        <div id="refCandle-pattern-report-container">
            <Toast ref={toast} />
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
                            onChange={onSelectStrategyChange} onHide={onSelectStrategyHide} placeholder="Select Versions" className="w-full align-self-end"  />
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
                        <label htmlFor="serverIsSucceed" className="align-self-baseline">Is Succeed?</label>
                        <Dropdown id='serverIsSucceed' value={selectedServerIsSucceed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsSucceed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    {/* DELETED FOR CLIENT VERSION */}
                    {/* <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverLowerTimeFrameDivergenceIn" className="align-self-baseline">Lower Time Frame Divergence In</label>
                        <Dropdown id='serverLowerTimeFrameDivergenceIn' value={selectedServerLowerTimeFrameDivergenceIn} options={lowerTimeFrameDivergenceSelection} showClear
                            onChange={(e) => setSelectedServerLowerTimeFrameDivergenceIn(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber id="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance} onValueChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <Divider align="left">
                        <b>Candlestick Filters</b>
                    </Divider>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRefCandleBodyRatio" className="align-self-baseline">Max RefCandle Body Ratio</label>
                        <InputNumber id="serverRefCandleBodyRatio" value={selectedServerRefCandleBodyRatio} onValueChange={(e) => setSelectedServerRefCandleBodyRatio(e.value)}
                            showButtons className="w-full align-self-end" placeholder="Default: 100" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRefCandleShadowsDifference" className="align-self-baseline">Max RefCandle Shadows Difference</label>
                        <InputNumber id="serverRefCandleShadowsDifference" value={selectedServerRefCandleShadowsDifference} onValueChange={(e) => setSelectedServerRefCandleShadowsDifference(e.value)}
                            showButtons className="w-full align-self-end" placeholder="Default: 100" />
                    </div>
                    <Tooltip id="tooltip-candlestick" place="bottom">
                        <div><Image src={tooltipImage} alt="candlestick help" width='500' /></div>
                    </Tooltip>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-candlestick">
                            <label htmlFor="serverCandlestickPattern" className="align-self-baseline">Candlestick Pattern Direction</label>
                            <Dropdown id='serverIsCandlestickPattern' value={selectedServerIsPinBar} options={pinBarSelection} filter showClear
                                onChange={(e) => setSelectedServerIsPinBar(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                        </TooltipWrapper>
                    </div>
                    <Divider />
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRisk" className="align-self-baseline">Min Potential R/R</label>
                        <InputNumber id="serverRewardToRisk" value={selectedServerRewardToRisk} onValueChange={(e) => setSelectedServerRewardToRisk(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" placeholder="Default: 0" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverMinWinRatio" className="align-self-baseline">Min Win Ratio</label>
                        <InputNumber id="serverMinWinRatio" value={selectedServerMinWinRatio} onValueChange={(e) => setSelectedServerMinWinRatio(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={2} min={0} max={1} showButtons className="w-full align-self-end" />
                    </div>

                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRegressionTolerance" className="align-self-baseline">Regression Tolerance</label>
                        <InputNumber id="serverRegressionTolerance" value={selectedServerRegressionTolerance} onValueChange={(e) => setSelectedServerRegressionTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" placeholder="Default: 0.5" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4 flex flex-wrap align-content-center">
                        <div className='col-2'>
                            <InputSwitch inputId="serverIncludePositions" checked={selectedServerIncludePositions} onChange={(e) => setSelectedServerIncludePositions(e.value)} />
                        </div>
                        <label htmlFor="serverIncludePositions" className="col-10 align-self-center">Include Positions Records</label>
                    </div>
                    <div className="col-12 md:col-6 lg:col-8"></div>

                    <FiltersStatement commonFiltersStatement={commonFilterStatement} specialFiltersStatement={bestPatternWithFixRewardToRiskStatement} />
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Go" id="search-btn" className="p-button-raised ml-auto mt-2 mb-2"
                            loading={loading || loadingForBestPatternWithFixRR}
                            icon="pi pi-caret-right" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-pattern-report-withfixrr"
                            onSave={loadData} buttonClassNames="mt-2 mb-2" />
                    </div>

                    <div className="p-field col-12 md:col-12 lg:col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Status" value={statusForBestPatternWithFixRR} />
                        <ProgressBar value={progressValueForBestPatternWithFixRR} mode={progressModeForBestPatternWithFixRR}
                            displayValueTemplate={displayValueTemplate} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <Panel headerTemplate={templatePanel} toggleable className='mb-2'>
                <DataTable value={summaryData} className={"p-datatable-sm mb-2"} showGridlines scrollDirection="both" scrollable
                    loading={loading} header={summaryHeader} contextMenuSelection={selectedContent}
                    onContextMenuSelectionChange={e => setSelectedContent(e)} scrollHeight="550px"
                    cellClassName={(data, options) => options.field} onContextMenu={e => cm.current.show(e.originalEvent)}>
                    {columnHelper.generatColumns(summaryColumns, "dt-state-refCandle-pattern-summary")}
                </DataTable>
            </Panel>
            <Paginator ref={bestPatternWithFixRRPg} setFirst={setBestPatternWithFixRRFirst} setRows={setBestPatternWithFixRRRows} />
            <DataTable ref={dt} value={bestPatternFixRewardToRiskData?.bestPatterns ?? []} className={"p-datatable-sm"} scrollable
                showGridlines filterDisplay="row" scrollDirection="both"
                onValueChange={filteredData => setBestPatternFixRewardToRiskTotalRows(filteredData.length)} rowHover={true}
                loading={loadingForBestPatternWithFixRR} header={patternFixRewardToRiskHeader} scrollHeight="550px"
                contextMenuSelection={selectedContent} sortMode="multiple" filters={bestPatternWithFixRewardToRiskDTFilters}
                onFilter={onBestPatternWithFixRewardToRiskCustomFilter}
                onContextMenuSelectionChange={e => setSelectedContent(e)}
                footer={bestPatternFixRewardToRiskFooter}
                cellClassName={(data, options) => options.field}
                onContextMenu={e => cm.current.show(e.originalEvent)}
                paginator paginatorTemplate={bestPatternWithFixRRPg.current?.paginatorTemplate} first={bestPatternWithFixRRFirst} rows={bestPatternWithFixRRRows} onPage={bestPatternWithFixRRPg.current?.onPage}>

                {columnHelper.generatColumns(patternsFixRewardToRiskColumns, "dt-state-refCandle-pattern-best-patterns-fixrr", bestPatternWithFixRewardToRiskFilteredColumns)}

            </DataTable>
            {selectedServerIncludePositions && <PositionTable loading={loading} positions={positions} setPositions={setPositions} customRewardToRisk={selectedServerRewardToRisk}
                tableStateName="dt-state-refCandle-pattern-best-patterns-fixrr-position" dataTableName="dt-state-refCandle-pattern-best-patterns-fixrr-position"
                message="Attention: Positions colorize is based on potential r/r." customColorizeRow={colorizeRow} />}
        </div>);
}

export default BestPatternWithFixRewardToRisk;