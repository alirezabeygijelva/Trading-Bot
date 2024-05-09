import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { Tooltip } from 'primereact/tooltip';
import { scalpServices } from '../../services/ScalpServices';
import { dateHelper } from '../../utils/DateHelper';
import { contentHelper } from '../../utils/ContentHelper';
import { filterHelper } from '../../utils/FilterHelper';
import { templates } from '../../utils/Templates';
import { visibilityDetector } from '../../utils/VisibilityDetector';
import { columnHelper } from '../../utils/ColumnHelper';
import { QuickActionsContext } from '../../contexts/QuickActionsContext';
import Export from '../../components/Export';
import { FilterType } from '../../utils/FilterType';
import FilterManager from '../../components/FilterManager';
import { exchangeServices } from '../../services/ExchangeServices';
import { Toast } from 'primereact/toast';
import useTranslation from '../../lib/localization';
import '../../assets/scss/BestParametersOfTheStopReport.scss';
import FiltersStatement from '../FiltersStatement';
import PositionTable from '../PositionTable';
import { IntervalHelper } from '../../utils/IntervalHelper';
import Paginator from '../Paginator';
import { InputSwitch } from 'primereact/inputswitch';
import LabelWithValue from '../LabelWithValue';
import { ProgressBar } from 'primereact/progressbar';
import tooltipImage from '../../assets/images/STOPLOSSTOLERANCE.png';
import { Tooltip as ReactTooltip, TooltipWrapper } from 'react-tooltip';
import { Image } from 'primereact/image';

//REPORT 5 (Analytical)
const BestParametersOfStopReport = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const state = window.localStorage.getItem("server-filters-bestresultbasedonparametersofstop");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const interval = React.useRef(null);
    const [status, setStatus] = React.useState(null);
    const [progressValue, setProgressValue] = React.useState(0);
    const [progressMode, setProgressMode] = React.useState('determinate');
    const dt = React.useRef(null);
    const [token, setToken] = React.useState(0);
    const differencePercentagesPg = React.useRef(null);
    const cm = React.useRef(null);
    const toast = React.useRef(null);
    const { addItems, clearItem } = React.useContext(QuickActionsContext);
    const [data, setData] = React.useState({});
    const [selectedPositions, setSelectedPositions] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = React.useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerRewardToRiskRange, setSelectedServerRewardToRiskRange] = React.useState(filtersDefValue.rewardToRiskRange ?? "1-10");
    const [selectedServerRewardToRiskStep, setSelectedServerRewardToRiskStep] = React.useState(filtersDefValue.rewardToRiskStep ?? 0.5);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'days').toDate()));
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate()));
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerMinWinRatio, setSelectedServerMinWinRatio] = React.useState(filtersDefValue.minWinRatio);
    const [selectedServerIncludePositions, setSelectedServerIncludePositions] = React.useState(filtersDefValue.includePositions ?? false);
    const [selectedServerStopLossToleranceStep, setSelectedServerStopLossToleranceStep] = React.useState(filtersDefValue.stopLossToleranceStep ?? "0.01");
    const [selectedServerMaxStopLossTolerance, setSelectedServerMaxStopLossTolerance] = React.useState(filtersDefValue.maxStopLossTolerance ?? "0.1");
    const [selectedServerMaxNumberOfCandle, setSelectedServerMaxNumberOfCandle] = React.useState(filtersDefValue.maxNumberOfCandle ?? 15);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [symbols, setSymbols] = React.useState([]);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = React.useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = React.useState(null);
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = React.useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = React.useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = React.useState(null);
    const [bestPatternFilteredColumns, setBestPatternFilteredColumns] = React.useState([]);
    const [bestPatternDatatableFilters, setBestPatternDatatableFilters] = React.useState({});
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [positions, setPositions] = React.useState([]);
    const [selectedSymbolsDynamicRewardToRiskAndSymbol, setSelectedSymbolsDynamicRewardToRiskAndSymbol] = React.useState([]);
    const [differencePercentagesFirst, setDifferencePercentagesFirst] = React.useState(0);
    const [differencePercentagesRows, setDifferencePercentagesRows] = React.useState(10);

    const [numericColumnComparisonTypePatterns, setNumericColumnComparisonTypePatterns] = React.useState({
        differencePercentage: '',
        rewardToRisk: '',
        positionsCount: '',
        winRatio: '',
        pureRewardToRiskSum: '',
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
               if(filterData && filterData.startDate && filterData.startDate!=null ){
                setSelectedServerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
               }
               if(filterData && filterData.endDate && filterData.endDate!=null ){
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
            if(filterData && filterData.startDate && filterData.startDate!=null ){
                setSelectedServerStartDate(dateHelper.utcEpochSecondsToDate(filterData.startDate));
             }
             if(filterData && filterData.endDate && filterData.endDate!=null ){
                setSelectedServerEndDate(dateHelper.utcEpochSecondsToDate(filterData.endDate));
            }
            } else {
                setDefualtFilterData();
            }
    
        }
    const onTimeFrameSelectChange = (e) => {
            setSelectedServerInterval(e.value);
            if (e.value && allFiltersData && allFiltersData.timeFrameSymbols && allFiltersData.timeFrameSymbols[e.value] && allFiltersData.timeFrameSymbols[e.value]!=null) {
               
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
        return () => {
            clearItem();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerIsRegisteredInMarket, selectedServerReasonsToNotEnter, selectedServerRewardToRiskTolerance]);

    React.useEffect(() => {
        addItems(
            [{
                itemId: 'positions-show-on-chart',
                label: 'Show on Chart',
                icon: 'pi pi-chart-bar',
                className: 'p-button-success',
                command: showOnChart,
                template: (item, options) => {
                    return (
                        <React.Fragment>
                            <Tooltip target={`.${item.itemId}`} position="left" />
                            <Button id='floatingShowChart'
                                onClick={options.onClick} data-pr-tooltip={item.label}
                                className={classNames(item.itemId, options.iconClassName, options.className, item.className)} />
                        </React.Fragment>
                    );
                }
            }]);
    }, [selectedPositions]); // eslint-disable-line react-hooks/exhaustive-deps

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

        visibilityDetector.attach('positions-container');
        setSelectedPositions(null);
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
            setDefaultSymbols(data);
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
        setData({});
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

        scalpServices.getBestParametersOfStopReportReport(token, strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerRewardToRiskRange, selectedServerRewardToRiskStep, selectedServerReasonsToNotEnter,
            selectedServerMinWinRatio, selectedServerIncludePositions, selectedServerMaxNumberOfCandle
            , selectedServerMaxStopLossTolerance, selectedServerStopLossToleranceStep, selectedServerRewardToRiskTolerance).then(response => {
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
                        setProgressMode('indeterminate');
                    } else {
                        setProgressMode('determinate');
                    }
                    if (response.data.progress)
                        setProgressValue(response.data.progress * 100);

                    if (response.data.isFinished && response.data.isFailed) {
                        clearInterval(interval.current);
                        interval.current = null;
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.data.message?.substring(0, 250),
                            life: 60000
                        });
                        setData({})
                        setPositions([])
                        setLoading(false);
                    }

                    if (response.data.isFinished && response.data.progress === 1) {
                        clearInterval(interval.current);
                        interval.current = null;
                        setData(response.data?.responseData);
                        selectedServerIncludePositions && setPositions(response.data?.responseData?.positions)
                        setLoading(false);
                        setStatus(response.data.status);
                        return false;
                    } else
                        setStatus(response.data.status);
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
                    setData({})
                    setPositions([])
                    setLoading(false);
                }
            });
        }, 1000);
    }

    const showOnChart = () => {
        if (selectedPositions) {
            navigate('/chart', {
                state: { positionsToShow: selectedPositions }
            });
        }
    }

    //#region Start Numeric Filter
    const onNumericFilter = (type) => {
        var temp = { ...numericColumnComparisonTypePatterns };
        temp[displayNumericColumnFilter] = selectedNumericFilterType;
        setNumericColumnComparisonTypePatterns(temp);

        dt.current.filter(selectedNumericFilterValue, displayNumericColumnFilter, 'custom');
        setSelectedNumericFilterValue(null);
        setSelectedNumericFilterType(null);
        onNumericFilterHide(type);
    }

    const onNumericFilterClear = (name) => {
        var temp = { ...numericColumnComparisonTypePatterns };
        temp[name] = '';
        setNumericColumnComparisonTypePatterns(temp);
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

    const resetPatternTable = () => {
        setNumericColumnComparisonTypePatterns({
            differencePercentage: '',
            rewardToRisk: '',
            positionsCount: '',
            winRatio: '',
            pureRewardToRiskSum: '',
        });
        setBestPatternFilteredColumns([]);
        setBestPatternDatatableFilters([]);
        setSelectedSymbolsDynamicRewardToRiskAndSymbol(null);
        dt.current.reset();
    }

    const onCustomPatternsFilter = (ev) => {
        setBestPatternFilteredColumns(Object.keys(ev.filters));
        setBestPatternDatatableFilters(ev.filters);
    }

    const onSymbolChangeDynamicRewardToRiskAndSymbol = (e) => {
        dt.current.filter(e.value, 'symbol', 'in');
        setSelectedSymbolsDynamicRewardToRiskAndSymbol(e.value);
    }

    const symbolFilter = <MultiSelect value={selectedSymbolsDynamicRewardToRiskAndSymbol} options={symbols}
        onChange={(ev) => onSymbolChangeDynamicRewardToRiskAndSymbol(ev)}
        placeholder="Select a Symbol" className="p-column-filter multiselect-custom" filter showClear />;
    const positionsCountFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('positionsCount', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('positionsCount')} />
        </span>
    const winRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('winRatio', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('winRatio')} />
        </span>
    const numberOfCandleBeforeTriggerFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('numberOfCandleBeforeTrigger', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('numberOfCandleBeforeTrigger')} />
        </span>
    const toleranceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('tolerance', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('tolerance')} />
        </span>
    const rewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRisk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRisk')} />
        </span>
    const pureRewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskPure', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskPure')} />
        </span>

    const columns = [
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
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRisk",
            header: "Min Potential R/R",
            sortable: true,
            filter: true,
            filterElement: rewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, 2))
                , filterValue, numericColumnComparisonTypePatterns.rewardToRisk),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "numberOfCandleBeforeTrigger",
            header: "Ref candle scope candles count",
            sortable: true,
            filter: true,
            filterElement: numberOfCandleBeforeTriggerFilter,
            filterFunction: (columnValue, filterValue) =>
                filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypePatterns.numberOfCandleBeforeTrigger),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "tolerance",
            header: "Stop loss tolerance",
            sortable: true,
            filter: true,
            filterElement: toleranceFilter,
            filterFunction: (columnValue, filterValue) =>
                filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypePatterns.tolerance),
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
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonTypePatterns.positionsCount),
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
                , filterValue, numericColumnComparisonTypePatterns.winRatio),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "Min Potential R/R Sum",
            sortable: true,
            filter: true,
            filterElement: pureRewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, columnValue > 1 ? 0 : 2))
                , filterValue, numericColumnComparisonTypePatterns.rewardToRiskPure),
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
            bodyClassName: "text-center",
            style: { 'minWidth': '50px', width: '100px' }
        }
        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSum",
        //     header: "Min Potential Pure R/R Sum",
        //     sortable: true,
        //     filter: true,
        //     filterElement: pureRewardToRiskFilter,
        //     filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(parseFloat(contentHelper.digitFormat(columnValue, columnValue > 1 ? 0 : 2))
        //         , filterValue, numericColumnComparisonTypePatterns.rewardToRiskPure),
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, rowData[raw.field] > 1 ? 0 : 2),
        //     bodyClassName: "text-center",
        //     style: { 'minWidth': '50px', width: '100px' }
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
            label: t("serverFilters.reasonToNotEnter"),
            type: FilterType.MultiSelect,
            options: reasonsToNotEnter,
            state: selectedServerReasonsToNotEnter,
            setState: setSelectedServerReasonsToNotEnter
        },
        {
            name: "minWinRatio",
            label: "Min Win Ratio",
            type: FilterType.Decimal,
            state: selectedServerMinWinRatio,
            setState: setSelectedServerMinWinRatio
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
            name: "maxNumberOfCandle",
            label: "Ref candle scope candles count",
            type: FilterType.Number,
            state: selectedServerMaxNumberOfCandle,
            setState: setSelectedServerMaxNumberOfCandle
        },
        {
            name: "maxStopLossTolerance",
            label: "Max Stop loss tolerance",
            type: FilterType.Decimal,
            state: selectedServerMaxStopLossTolerance,
            setState: setSelectedServerMaxStopLossTolerance
        },
        {
            name: "stopLossToleranceStep",
            label: "Stop loss tolerance Step",
            type: FilterType.Decimal,
            state: selectedServerStopLossToleranceStep,
            setState: setSelectedServerStopLossToleranceStep
        },
        {
            name: "rewardToRiskTolerance",
            label: "R/R Tolerance",
            type: FilterType.Decimal,
            state: selectedServerRewardToRiskTolerance,
            setState: setSelectedServerRewardToRiskTolerance
        },
        {
            name: "includePositions",
            label: "Include Positions Records",
            type: FilterType.Switch,
            state: selectedServerIncludePositions,
            setState: setSelectedServerIncludePositions
        },
    ]

    const colorizeRow = (rowData) => {
        if (rowData.registeredInMarket) {
            if (rowData.customStopTrailRewardToRisk > 0)
                return { 'succeed': true }
            else if (rowData.customStopTrailRewardToRisk < 0)
                return { 'failed': true }
        }
    }

    const bestPatternsHeader = (
        <div className="table-header-container flex-wrap align-items-center">
            <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(data.details, "stop-trail best patterns")} className="p-button-info" tooltip="XLS" />
            <div className="filter-container">
                <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={() => resetPatternTable()} />
                <span className="flex p-input-icon-left">
                </span>
            </div>
        </div>
    );

    const displayValueTemplate = (value) => {
        return (
            <React.Fragment>
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%
            </React.Fragment>
        );
    }

    return (
        <div id="parameters-of-stop-report-container">
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
                        <label htmlFor="serverIsRegisteredInMarket" className="align-self-baseline">Is Registered In Market?</label>
                        <Dropdown id='serverIsRegisteredInMarket' value={selectedServerIsRegisteredInMarket} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsRegisteredInMarket(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
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
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap"></div>
                    <div className="col-12 md:col-6 lg:col-6 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskRange" className="align-self-baseline">R/R Range</label>
                        <InputText id='serverRewardToRiskRange' value={selectedServerRewardToRiskRange} keyfilter={new RegExp('[0-9-.,]+$')}
                            onChange={(e) => setSelectedServerRewardToRiskRange(e.target.value)} className="w-full align-self-end" placeholder="Default: 1-10" />
                        <span className='hint-lable'>1-5 or 2,6,7 or 4</span>
                    </div>
                    <div className="col-12 md:col-6 lg:col-6 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskStep" className="align-self-baseline">R/R Step</label>
                        <InputNumber id="serverRewardToRiskStep" value={selectedServerRewardToRiskStep} onValueChange={(e) => setSelectedServerRewardToRiskStep(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" placeholder="Default: 0.5" />
                        <span className='empty-space'>.</span>
                    </div>
                    <ReactTooltip id="tooltip-stopParameters" place="bottom" >
                        <div><Image src={tooltipImage} alt="stopParameters help" width='500' /></div>
                    </ReactTooltip>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-stopParameters">
                            <label htmlFor="serverMaxNumberOfCandle" className="align-self-baseline">Ref candle scope candles count</label>
                            <InputNumber id="serverMaxNumberOfCandle" value={selectedServerMaxNumberOfCandle} onValueChange={(e) => setSelectedServerMaxNumberOfCandle(e.value)}
                                min={0} showButtons className="w-full align-self-end" />
                        </TooltipWrapper>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap hasTooltip">
                        <TooltipWrapper tooltipId="tooltip-stopParameters">
                            <label htmlFor="serverMaxStopLossTolerance" className="align-self-baseline">Max Stop loss tolerance</label>
                            <InputNumber id="serverMaxStopLossTolerance" value={selectedServerMaxStopLossTolerance} onValueChange={(e) => setSelectedServerMaxStopLossTolerance(e.value)}
                                mode="decimal" minFractionDigits={0} maxFractionDigits={4} min={0} max={1} showButtons className="w-full align-self-end" />
                        </TooltipWrapper>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStopLossToleranceStep" className="align-self-baseline">Stop loss tolerance Step</label>
                        <InputNumber id="serverStopLossToleranceStep" value={selectedServerStopLossToleranceStep} onValueChange={(e) => setSelectedServerStopLossToleranceStep(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverMinWinRatio" className="align-self-baseline">Min Win Ratio</label>
                        <InputNumber id="serverMinWinRatio" value={selectedServerMinWinRatio} onValueChange={(e) => setSelectedServerMinWinRatio(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={2} min={0} max={1} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap align-content-center mt-4">
                        <InputSwitch inputId="serverIncludePositions" checked={selectedServerIncludePositions} onChange={(e) => setSelectedServerIncludePositions(e.value)} />
                        <label htmlFor="serverIncludePositions" className="align-self-center ml-2">Include Positions Records</label>
                    </div>
                    {/* <div className="col-12 md:col-4 lg:col-6 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskRange" className="align-self-baseline">Dynamic R/R Range</label>
                        <InputText id='serverRewardToRiskRange' value={selectedServerRewardToRiskRange} placeholder="1-5 or 2,6,7 or 4 (Default: 1-10)" keyfilter={new RegExp('[0-9-.,]+$')}
                            onChange={(e) => setSelectedServerRewardToRiskRange(e.target.value)} className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-4 lg:col-6 flex flex-wrap">
                        <label htmlFor="serverRewardToRiskStep" className="align-self-baseline">Dynamic R/R Step</label>
                        <InputNumber id="serverRewardToRiskStep" value={selectedServerRewardToRiskStep} onValueChange={(e) => setSelectedServerRewardToRiskStep(e.value)}
                            mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" placeholder="Default: 0.5" />
                    </div> */}

                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Go" id="search-btn" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-caret-right" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-bestresultbasedonparametersofstop"
                            onSave={loadData} />
                    </div>
                    <div className="p-field col-12 md:col-12 lg:col-12">
                        <LabelWithValue className="p-inputgroup" displayText="Status" value={status} />
                        <ProgressBar value={progressValue} mode={progressMode} displayValueTemplate={displayValueTemplate} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <div className="grid p-fluid flex-1 flex-wrap">
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Positions Count" value={data.currentPositionsCount} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Start Date" value={data.startDate} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="End Date" value={data.endDate} />
                    </div>
                </div>
            </Card>
            <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
            <Card>
                <Paginator ref={differencePercentagesPg} setFirst={setDifferencePercentagesFirst} setRows={setDifferencePercentagesRows} />
                <DataTable ref={dt} value={data.details} className="p-datatable-sm mb-5"
                    scrollable showGridlines filterDisplay="row" scrollDirection="both" rowHover={true}
                    loading={loading} scrollHeight="550px" contextMenuSelection={selectedContent} sortMode="multiple"
                    header={bestPatternsHeader}
                    filters={bestPatternDatatableFilters} onFilter={onCustomPatternsFilter}
                    onContextMenuSelectionChange={e => setSelectedContent(e)}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}
                    paginator paginatorTemplate={differencePercentagesPg.current?.paginatorTemplate}
                    first={differencePercentagesFirst} rows={differencePercentagesRows} onPage={differencePercentagesPg.current?.onPage}>

                    {columnHelper.generatColumns(columns, "dt-state-bestresultbasedonparametersofstop"
                        , bestPatternFilteredColumns)}

                </DataTable>
                {selectedServerIncludePositions && <PositionTable loading={loading} positions={positions} setPositions={setPositions} hasStopTrailColumns={true}
                    tableStateName="dt-state-positions-bestresultbasedonparametersofstop" dataTableName="dt-state-positions-bestresultbasedonparametersofstop" customColorizeRow={colorizeRow}
                    message="Attention: The win/loss calculation of positions uses 'Potential R/R' in this report" />}
            </Card>
        </div>);
}

export default BestParametersOfStopReport;