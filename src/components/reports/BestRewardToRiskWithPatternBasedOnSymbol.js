import React, { useRef, useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
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
import { IntervalHelper } from '../../utils/IntervalHelper';
import Paginator from '../Paginator';
import { Divider } from 'primereact/divider';
import { Tooltip, TooltipWrapper } from 'react-tooltip';
import { Image } from 'primereact/image';
import tooltipImage from '../../assets/images/PLOTPATTERN.jpg';

const BestRewardToRiskWithPatternBasedOnSymbol = () => {
    const state = window.localStorage.getItem("server-filters-pattern-report-basedonsymbol");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const interval = useRef(null);
    const [statusForBestPatternBasedOnSymbol, setStatusForBestPatternBasedOnSymbol] = React.useState(null);
    const [progressValueForBestPatternBasedOnSymbol, setProgressValueForBestPatternBasedOnSymbol] = React.useState(0);
    const [progressModeForBestPatternBasedOnSymbol, setProgressModeForBestPatternBasedOnSymbol] = React.useState('determinate');
    const bestPatternWithDynamicRewardToRiskAndSymbolDT = useRef(null);
    const cm = React.useRef(null);
    const toast = React.useRef(null);
    const [positions, setPositions] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerIsPinBar, setSelectedServerIsPinBar] = React.useState(filtersDefValue.isPinBar);
    const [selectedServerIsSucceed, setSelectedServerIsSucceed] = React.useState(filtersDefValue.isSucceed);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    //CHANGED FOR CLIENT VERSION 
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
    const [selectedServerRewardToRiskRange, setSelectedServerRewardToRiskRange] = React.useState(filtersDefValue.rewardToRiskRange ?? "1-10");
    const [selectedServerRewardToRiskStep, setSelectedServerRewardToRiskStep] = React.useState(filtersDefValue.rewardToRiskStep ?? 0.5);
    const [selectedServerMinWinRatio, setSelectedServerMinWinRatio] = React.useState(filtersDefValue.minWinRatio);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [selectedServerIncludePositions, setSelectedServerIncludePositions] = React.useState(filtersDefValue.includePositions ?? true);
    const [symbols, setSymbols] = React.useState([]);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [bestPatternDynamicRewardToRiskAndSymbolData, setBestPatternDynamicRewardToRiskAndSymbolData] = React.useState([]);
    const [token, setToken] = React.useState(0);
    const [commonFilterStatement, setCommonFilterStatement] = React.useState([]);
    const [bestPatternBasedOnSymbolStatement, setBestPatternBasedOnSymbolStatement] = React.useState([]);
    const [currentDataTable, setCurrentDataTable] = React.useState(null);
    const [currentDataTableName, setCurrentDataTableName] = React.useState(null);
    const [dynamicRewardToRiskAndSymbolTotalPure, setDynamicRewardToRiskAndSymbolTotalPure] = React.useState(0);
    const [dynamicRewardToRiskAndSymbolTotalRows, setDynamicRewardToRiskAndSymbolTotalRows] = React.useState(0);
    const bestRRWithPatternBasedSymbolPg = useRef(null);
    const [bestRRWithPatternBasedSymbolFirst, setBestRRWithPatternBasedSymbolFirst] = useState(0);
    const [bestRRWithPatternBasedSymbolRows, setBestRRWithPatternBasedSymbolRows] = useState(10);

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const pinBarSelection = [
        { label: 'True', value: 'true' },
        { label: 'Reverse', value: 'false' }
    ];

    //CHANGED FOR CLIENT VERSION 
    // const lowerTimeFrameDivergenceSelection = [
    //     { label: 'None', value: 1 },
    //     { label: 'One Phase', value: 2 },
    //     { label: 'Two Phases', value: 3 },
    //     { label: 'Both', value: 4 },
    //     { label: 'Any', value: 5 }
    // ];


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
        //CHANGED FOR CLIENT VERSION 
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
            name: "Dynamic R/R: ",
            description: `Get positions data based on these reward to risks: Range <strong>${selectedServerRewardToRiskRange === "" ? "1-10" : selectedServerRewardToRiskRange}</strong>`
                + ` (step: <strong>${selectedServerRewardToRiskStep ?? 0.5}</strong>)`
        })
        setBestPatternBasedOnSymbolStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerRefCandleBodyRatio
        , selectedServerRefCandleShadowsDifference, selectedServerRewardToRisk, selectedServerIsPinBar
        , selectedServerIsSucceed, selectedServerRewardToRiskRange, selectedServerRewardToRiskStep
        , selectedServerReasonsToNotEnter, selectedServerRewardToRiskTolerance]);

    const loadData = async () => {
        setLoading(true);
        setProgressValueForBestPatternBasedOnSymbol(0);
        setStatusForBestPatternBasedOnSymbol('Loading...');


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

        scalpServices.getBestPatternDynamicRewardToRiskAndSymbolReport(token, strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerRefCandleBodyRatio, selectedServerRefCandleShadowsDifference
            , selectedServerRewardToRisk, selectedServerIsPinBar, selectedServerIsSucceed
            , selectedServerRewardToRiskRange, selectedServerRewardToRiskStep, selectedServerReasonsToNotEnter
            , null, selectedServerMinWinRatio, selectedServerRewardToRiskTolerance).then(() => {
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
                        setProgressModeForBestPatternBasedOnSymbol('indeterminate');
                    } else {
                        setProgressModeForBestPatternBasedOnSymbol('determinate');
                    }
                    if (response.data.progress)
                        setProgressValueForBestPatternBasedOnSymbol(response.data.progress * 100);

                    if (response.data.isFinished && response.data.isFailed) {
                        clearInterval(interval.current);
                        interval.current = null;
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.data.message,
                        });
                        setBestPatternDynamicRewardToRiskAndSymbolData([])
                        setLoading(false);
                    }

                    if (response.data.isFinished && response.data.progress === 1) {
                        clearInterval(interval.current);
                        interval.current = null;
                        setBestPatternDynamicRewardToRiskAndSymbolData(response.data?.responseData?.bestPatterns);
                        if (selectedServerIncludePositions)
                            setPositions(response.data?.responseData?.positions);
                        setDynamicRewardToRiskAndSymbolTotalRows(response.data?.responseData?.bestPatterns?.length ?? 0);
                        setDynamicRewardToRiskAndSymbolTotalPure(response.data?.responseData?.bestPatterns?.map(x => x.rewardToRiskSum)?.reduce((a, b) => a + b, 0) ?? 0)
                        setLoading(false);
                        setStatusForBestPatternBasedOnSymbol(response.data.status);
                        return false;
                    } else
                        setStatusForBestPatternBasedOnSymbol(response.data.status);
                }
                else {
                    clearInterval(interval.current);
                    interval.current = null;
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message,
                    });
                    setBestPatternDynamicRewardToRiskAndSymbolData([])
                    setLoading(false);
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
    const [selectedSymbolsDynamicRewardToRiskAndSymbol, setSelectedSymbolsDynamicRewardToRiskAndSymbol] = useState([]);
    const [bestPatternWithDynamicRewardToRiskAndSymbolDTFilters, setBestPatternWithDynamicRewardToRiskAndSymbolDTFilters] = useState({});
    const [bestPatternWithDynamicRewardToRiskAndSymbolFilteredColumns, setBestPatternWithDynamicRewardToRiskAndSymbolFilteredColumns] = useState([]);
    const [numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol, setNumericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol] = useState({
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
        'WithDynamicRewardToRiskAndSymbol': setNumericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol,
    }

    ///////////WithFixRewardToRisk
    const onNumericFilter = (type) => {
        var numericColumnComparisonType = null;
        // eslint-disable-next-line default-case
        switch (currentDataTableName) {
            case 'WithDynamicRewardToRiskAndSymbol':
                numericColumnComparisonType = numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol;
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
            case 'WithDynamicRewardToRiskAndSymbol':
                numericColumnComparisonType = numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol;
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

    const onSymbolChangeDynamicRewardToRiskAndSymbol = (e, table) => {
        table.current.filter(e.value, 'symbol', 'in');
        setSelectedSymbolsDynamicRewardToRiskAndSymbol(e.value);
    }

    //////WithDynamicRewardToRiskAndSymbol
    const symbolFilter = <MultiSelect value={selectedSymbolsDynamicRewardToRiskAndSymbol} options={symbols}
        onChange={(ev) => onSymbolChangeDynamicRewardToRiskAndSymbol(ev, bestPatternWithDynamicRewardToRiskAndSymbolDT)}
        placeholder="Select a Symbol" className="p-column-filter multiselect-custom" filter showClear />;
    const refCandleBodyRatioDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleBodyRatio', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleBodyRatio', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>
    const refCandleShadowsDifferenceDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleShadowsDifference', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleShadowsDifference', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>
    const positionsCountDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('positionsCount', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('positionsCount', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>
    const winRatioDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatio', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatio', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>
    const rewardToRiskPureDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskPure', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskPure', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>
    const rewardToRiskDynamicRewardToRiskAndSymbolFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRisk', 'decimal', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRisk', bestPatternWithDynamicRewardToRiskAndSymbolDT, 'WithDynamicRewardToRiskAndSymbol')} />
        </span>

    const resetBestPatternWithDynamicRewardToRiskAndSymbol = (table) => {
        setSelectedSymbolsDynamicRewardToRiskAndSymbol(null);
        setNumericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol({
            refCandleBodyRatio: '',
            refCandleShadowsDifference: '',
            positionsCount: '',
            winsCount: '',
            lossesCount: '',
            winRatio: '',
            variance: '',
            rewardToRiskPure: '',
            rewardToRiskPureMarket: '',
            rewardToRisk: '',
        });
        setBestPatternWithDynamicRewardToRiskAndSymbolFilteredColumns([]);
        setBestPatternWithDynamicRewardToRiskAndSymbolDTFilters([]);
        table.current.reset();
    }

    const onBestPatternWithDynamicRewardToRiskAndSymbolCustomFilter = (ev, dt) => {
        setBestPatternWithDynamicRewardToRiskAndSymbolFilteredColumns(Object.keys(ev.filters));
        setBestPatternWithDynamicRewardToRiskAndSymbolDTFilters(ev.filters);
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
            label: "Candlestick Pattern",
            type: FilterType.DropDown,
            options: pinBarSelection,
            state: selectedServerIsPinBar,
            setState: setSelectedServerIsPinBar
        },
        {
            name: "rewardToRiskRange",
            label: "Dynamic R/R Range",
            type: FilterType.Text,
            state: selectedServerRewardToRiskRange,
            setState: setSelectedServerRewardToRiskRange
        },
        {
            name: "rewardToRiskStep",
            label: "Dynamic R/R Step",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskStep,
            setState: setSelectedServerRewardToRiskStep
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
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        //CHANGED FOR CLIENT VERSION 
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

    const patternsDynamicRewardToRiskAndSymbolColumns = [
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
            field: "symbol",
            header: "Symbol",
            sortable: true,
            filter: true,
            filterElement: symbolFilter,
            body: templates.digitBodyTemplate,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleBodyRatio",
            header: "Max Body Ratio",
            sortable: true,
            filter: true,
            filterElement: refCandleBodyRatioDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.refCandleBodyRatio),
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
            filterElement: refCandleShadowsDifferenceDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.refCandleShadowsDifference),
            body: templates.digitBodyTemplate,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRisk",
            header: "Min Potential R/R",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.rewardToRisk),
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
            filterElement: positionsCountDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.positionsCount),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            filter: true,
            filterElement: winRatioDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, 2))
                , filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.winRatio),
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
            filterElement: rewardToRiskPureDynamicRewardToRiskAndSymbolFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, columnValue > 1 ? 0 : 2))
                , filterValue, numericColumnComparisonTypeWithDynamicRewardToRiskAndSymbol.rewardToRiskPure),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "duration",
            header: "Duration",
            sortable: true,
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
    ]

    const patternDynamicRewardToRiskAndSymbolHeader = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(bestPatternDynamicRewardToRiskAndSymbolData, "refCandlePatternBestPatternsDynamicRewardToRiskAndSymbol")} className="p-button-info" tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={() => resetBestPatternWithDynamicRewardToRiskAndSymbol(bestPatternWithDynamicRewardToRiskAndSymbolDT)} />
                <span className="flex p-input-icon-left">
                </span>
            </div>
        </div>
    );

    const patternDynamicRewardToRiskAndSymbolFooter = (
        <div className="table-footer-container flex-wrap align-items-center">
            <LabelWithValue displayText="Total" value={dynamicRewardToRiskAndSymbolTotalRows} />
            <div className="sum-container">
                <LabelWithValue displayText="Min Potential R/R Sum" value={contentHelper.digitFormat(dynamicRewardToRiskAndSymbolTotalPure, 2)} />
            </div>
        </div>
    );

    const setStatesValue = (data) => {
        setDynamicRewardToRiskAndSymbolTotalRows(data.length);
        setDynamicRewardToRiskAndSymbolTotalPure(data.map(x => x.rewardToRiskSum).reduce((a, b) => a + b, 0))
    }

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
                        <label htmlFor="serverIsSucceed" className="align-self-baseline">Is Succeed?</label>
                        <Dropdown id='serverIsSucceed' value={selectedServerIsSucceed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsSucceed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    {/* CHANGED FOR CLIENT VERSION */}
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
                    <Tooltip id="tooltip-candlestick" place="bottom" >
                        <div><Image src={tooltipImage} alt="candlestick help" width='500' /></div>
                    </Tooltip>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-candlestick">
                            <label htmlFor="serverCandlestickPattern" className="align-self-baseline">Candlestick Pattern</label>
                            <Dropdown id='serverIsCandlestickPattern' value={selectedServerIsPinBar} options={pinBarSelection} filter showClear
                                onChange={(e) => setSelectedServerIsPinBar(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                        </TooltipWrapper>
                    </div>
                    <Divider />

                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskRange" className="align-self-baseline">R/R Range</label>
                        <InputText id='serverRewardToRiskRange' value={selectedServerRewardToRiskRange} placeholder="Default: 1-10" keyfilter={new RegExp('[0-9-.,]+$')}
                            onChange={(e) => setSelectedServerRewardToRiskRange(e.target.value)} className="w-full align-self-end" />
                        <span className='hint-lable'>1-5 or 2,6,7 or 4</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskStep" className="align-self-baseline">R/R Step</label>
                        <InputNumber id="serverRewardToRiskStep" value={selectedServerRewardToRiskStep} onValueChange={(e) => setSelectedServerRewardToRiskStep(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" placeholder="Default: 0.5" />
                        <span className='empty-space'>.</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverMinWinRatio" className="align-self-baseline">Min Win Ratio</label>
                        <InputNumber id="serverMinWinRatio" value={selectedServerMinWinRatio} onValueChange={(e) => setSelectedServerMinWinRatio(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={2} min={0} max={1} showButtons className="w-full align-self-end" />
                        <span className='empty-space'>.</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-4 flex flex-wrap align-content-center">
                        <div className='col-2'>
                            <InputSwitch inputId="serverIncludePositions" checked={selectedServerIncludePositions} onChange={(e) => setSelectedServerIncludePositions(e.value)} />
                        </div>
                        <label htmlFor="serverIncludePositions" className="col-10 align-self-center">Include Positions Records</label>
                    </div>
                    <div className="col-12 md:col-6 lg:col-8"></div>

                    <FiltersStatement commonFiltersStatement={commonFilterStatement} specialFiltersStatement={bestPatternBasedOnSymbolStatement} />
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Go" id="search-btn" className="p-button-raised ml-auto mt-2 mb-2"
                            loading={loading}
                            icon="pi pi-caret-right" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-pattern-report-basedonsymbol"
                            onSave={loadData} buttonClassNames="mt-2 mb-2" />
                    </div>
                    <div className="p-field col-12 md:col-12 lg:col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Status" value={statusForBestPatternBasedOnSymbol} />
                        <ProgressBar value={progressValueForBestPatternBasedOnSymbol} mode={progressModeForBestPatternBasedOnSymbol}
                            displayValueTemplate={displayValueTemplate} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <Paginator ref={bestRRWithPatternBasedSymbolPg} setFirst={setBestRRWithPatternBasedSymbolFirst} setRows={setBestRRWithPatternBasedSymbolRows} />
            <DataTable ref={bestPatternWithDynamicRewardToRiskAndSymbolDT} value={bestPatternDynamicRewardToRiskAndSymbolData} className={"p-datatable-sm"} scrollable showGridlines filterDisplay="row" scrollDirection="both"
                onValueChange={filteredData => setStatesValue(filteredData)} rowHover={true}
                loading={loading} header={patternDynamicRewardToRiskAndSymbolHeader} scrollHeight="550px"
                contextMenuSelection={selectedContent} sortMode="multiple" filters={bestPatternWithDynamicRewardToRiskAndSymbolDTFilters}
                onFilter={(ev) => onBestPatternWithDynamicRewardToRiskAndSymbolCustomFilter(ev, bestPatternWithDynamicRewardToRiskAndSymbolDT)}
                onContextMenuSelectionChange={e => setSelectedContent(e)}
                footer={patternDynamicRewardToRiskAndSymbolFooter}
                cellClassName={(data, options) => options.field}
                onContextMenu={e => cm.current.show(e.originalEvent)}
                paginator paginatorTemplate={bestRRWithPatternBasedSymbolPg.current?.paginatorTemplate} first={bestRRWithPatternBasedSymbolFirst} rows={bestRRWithPatternBasedSymbolRows} onPage={bestRRWithPatternBasedSymbolPg.current?.onPage}>

                {columnHelper.generatColumns(patternsDynamicRewardToRiskAndSymbolColumns, "dt-state-refCandle-pattern-best-patterns-basedonsymbol"
                    , bestPatternWithDynamicRewardToRiskAndSymbolFilteredColumns)}

            </DataTable>
            {selectedServerIncludePositions && <PositionTable loading={loading} positions={positions} setPositions={setPositions} customRewardToRisk={selectedServerRewardToRisk}
                tableStateName="dt-state-refCandle-pattern-best-patterns-basedonsymbol-positions" dataTableName="dt-state-refCandle-pattern-best-patterns-basedonsymbol-positions"
                message="Attention: Positions colorize is based on potential r/r." customColorizeRow={colorizeRow} />}
        </div>);
}

export default BestRewardToRiskWithPatternBasedOnSymbol;