import React, { useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { ContextMenu } from "primereact/contextmenu";
import Paginator from '../components/Paginator';
import { DataTable } from "primereact/datatable";
import { columnHelper } from "../utils/ColumnHelper";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import ColumnManager from "./ColumnManager";
import Export from "./Export";
import { templates } from "../utils/Templates";
import { filterHelper } from "../utils/FilterHelper";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { contentHelper } from "../utils/ContentHelper";
import { sortHelper } from "../utils/SortHelper";
import { Dialog } from "primereact/dialog";
import { QuickActionsContext } from '../contexts/QuickActionsContext';
import { InputNumber } from "primereact/inputnumber";
import { scalpServices } from "../services/ScalpServices";
import { classNames } from "primereact/utils";
import { Tooltip } from "primereact/tooltip";
import '../assets/scss/PositionsTable.scss';
import { IntervalHelper } from "../utils/IntervalHelper";

const PositionTable = ({ positions, setPositions, customColorizeRow, loading, setLoading, tableStateName, message, dataTableName
    , customRewardToRisk, hasStopTrailColumns, filter = true, isChart, positionType, visibilityTemplate, visibilityHeaderTemplate, actionBodyTemplateScalp
    , prerequisiteTemplate, maxRewardToRiskVisibilityTemplate, potentialRewardToRiskVisibilityTemplate }, ref) => {
    const pg = useRef(null);
    const dt = useRef(null);
    const cm = useRef(null);
    const { addItems, clearItem } = useContext(QuickActionsContext);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedPositions, setSelectedPositions] = useState(null);
    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [selectedInterval, setSelectedInterval] = useState([]);
    const [selectedDivergenceStartDate, setSelectedDivergenceStartDate] = useState([]);
    const [selectedDivergenceEndDate, setSelectedDivergenceEndDate] = useState([]);
    const [selectedRefCandleDate, setSelectedRefCandleDate] = useState([]);
    const [selectedTriggerDate, setSelectedTriggerDate] = useState([]);
    const [selectedExitDate, setSelectedExitDate] = useState([]);
    const [selectedRiskFreeInitialDate, setSelectedRiskFreeInitialDate] = useState([]);
    const [selectedRiskFreeHitDate, setSelectedRiskFreeHitDate] = useState([]);
    const [selectedRegisteredInMarket, setSelectedRegisteredInMarket] = useState(null);
    const [selectedIsReviewed, setSelectedIsReviewed] = useState(null);
    const [selectedHasPattern, setSelectedHasPattern] = useState(null);
    const [selectedIsConfirmed, setSelectedIsConfirmed] = useState(null);
    const [selectedHasProperOverlap, setSelectedHasProperOverlap] = useState(null);
    const [selectedHasProperElongation, setSelectedHasProperElongation] = useState(null);
    const [selectedNumericFilterType, setSelectedNumericFilterType] = useState(null);
    const [selectedNumericFilterValue, setSelectedNumericFilterValue] = useState(null);
    const [selectedTextFilterType, setSelectedTextFilterType] = useState(null);
    const [selectedTextFilterValue, setSelectedTextFilterValue] = useState('');
    const [displayNumericFilterDialogForDecimal, setDisplayNumericFilterDialogForDecimal] = useState(false);
    const [displayNumericFilterDialogForInteger, setDisplayNumericFilterDialogForInteger] = useState(false);
    const [displayTextFilterDialog, setDisplayTextFilterDialog] = useState(false);
    const [displayNumericColumnFilter, setDisplayNumericColumnFilter] = useState(null);
    const [displayTextColumnFilter, setDisplayTextColumnFilter] = useState(null);
    const [filteredColumns, setFilteredColumns] = useState([]);
    const [datatableFilters, setDatatableFilters] = useState({});
    const [multiSortMeta, setMultiSortMeta] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [symbols, setSymbols] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [strategyNames, setStrategyNames] = useState([]);
    const [backtestNames, setBacktestNames] = useState([]);
    const [numericColumnComparisonType, setNumericColumnComparisonType] = useState({
        order: '',
        rewardToRisk: '',
        trigger: '',
        calculatedRiskFree: '',
        actualRiskFree: '',
        stopLoss: '',
        target: '',
        positionDurationInMinutes: '',
        customStopTrailRewardToRisk: '',
        customStopTrailCommission: '',
        customStopTrailPureRewardToRisk: '',
        quantityToTrade: '',
        depositNeeded: '',
        balanceBeforeDeposit: '',
        withdraw: '',
        realWithdraw: '',
        balanceAfterExit: '',
        enterCommissionFee: '',
        exitCommissionFee: '',
        leverage: '',
        commissionR: '',
        id: '',
        histogramNumberBasedOnRefCandle: '',
        histogramNumberBasedOnLivePrice: '',
        histogramNumberBasedOnLiveMacd: '',
        rewardToRiskPure: '',
        exchangeRewardToRisk: '',
        exchangeRewardToRiskPure: '',
        exchangeProfit: '',
        exchangeCommission: '',
        exchangeBalanceBeforePosition: '',
        usdtEnterCommissionFee: '',
        usdtExitCommissionFee: '',
        assetValueInUsdt: '',
        refCandleOpen: '',
        refCandleClose: '',
        refCandleHigh: '',
        refCandleLow: '',
        stopTrailTarget: '',
        stopTrailStop: '',
        stopTrailLevel: '',
        refCandleShadowsDifference: '',
        refCandleBodyRatio: '',
        slowCorrectionElongation: '',
        maxRewardToRisk: '',
        potentialRewardToRisk: '',
        stopTrailRewardToRisk: '',
        pattern3Value: '',
        strategyId: '',
        simulationId: '',
        exchangeAccountId: '',
        exchangePnl: '',
        exchangeUsdtCommission: '',
        exchangeCommissionR: '',
        refCandleLowerShadow: '',
        refCandleUpperShadow: '',
        exitAssetValueInUsdt: '',
        enterAssetValueInUsdt: '',
        calculatedTrigger: '',
        actualTrigger: '',
        calculatedStopLoss: '',
        actualStopLoss: '',
        calculatedTarget: '',
        actualTarget: '',
        actualQuantityToTrade: '',
        actualProfitAndLoss: '',
        calculatedQuantityToTrade: '',
        balanceBeforeOrder: '',
        calculatedWithdraw: '',
        actualWithdraw: '',
        actualEnterCommissionFee: '',
        actualExitCommissionFee: '',
        calculatedTriggerCommissionFee: '',
        calculatedStopLossCommissionFee: '',
        calculatedTargetCommissionFee: '',
        calculatedProfitAndLoss: '',
        calculatedCommissionFee: '',
        calculatedExitPrice: '',
        actualExitPrice: '',
        targetRewardToRisk: '',
        calculatedRewardToRisk: '',
        actualRewardToRisk: '',
        risk: '',
        calculatedBalanceAfterPosition: '',
        actualBalanceAfterPosition: '',
        distanceFromPeakPercentage: '',
        candleSizeAverageFromPeak: '',
        refCandleToCandlesAverageSizeRatio: ''
    });

    const [textColumnComparisonType, setTextColumnComparisonType] = useState({
        divergenceType: '',
        positionType: '',
        exitReason: '',
        reasonToNotEnter: '',
        marketTradeId: '',
        takeProfitTradeId: '',
        stopMarketTradeId: '',
        riskFreeOrderId: '',
        txId: '',
        marketOrderClientId: '',
        takeProfitOrderClientId: '',
        riskFreeOrderClientId: '',
        stopMarketOrderClientId: '',
        commissionAsset: '',
        onePhaseDivergence: '',
        twoPhasesDivergence: '',
        refCandlePatternString: '',
        lowerTimeFrameOnePhaseDivergence: '',
        lowerTimeFrameTwoPhasesDivergence: '',
        scriptVersion: '',
        analyticalStopLoss: '',
        simulationName: '',
        strategyName: '',
    });

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

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const intervals = IntervalHelper.intervalsList();

    useEffect(() => {
        return () => {
            clearItem();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
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

    useEffect(() => {
        setSelectedPositions(null);
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
        });
        scalpServices.getStrategiesDropDown().then((data) => {
            setStrategyNames(data ?? [])
        })
        scalpServices.getBacktestsDropDown().then((data) => {
            setBacktestNames(data ?? [])
        })
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onSymbolChange = (e) => {
        dt.current.filter(e.value, 'symbol', 'in');
        setSelectedSymbols(e.value);
    }

    const onIntervalChange = (e) => {
        dt.current.filter(e.value, 'timeFrameStr', 'equals');
        setSelectedInterval(e.value);
    }

    const onDivergenceStartDateChange = (e) => {
        dt.current.filter(e.value, 'divergenceStartDate', 'custom');
        setSelectedDivergenceStartDate(e.value);
    }

    const onDivergenceEndDateChange = (e) => {
        dt.current.filter(e.value, 'divergenceEndDate', 'custom');
        setSelectedDivergenceEndDate(e.value);
    }

    const onRefCandleDateChange = (e) => {
        dt.current.filter(e.value, 'refCandleDate', 'custom');
        setSelectedRefCandleDate(e.value);
    }

    const onTriggerDateChange = (e) => {
        dt.current.filter(e.value, 'triggerDate', 'custom');
        setSelectedTriggerDate(e.value);
    }

    const onExitDateChange = (e) => {
        dt.current.filter(e.value, 'exitDate', 'custom');
        setSelectedExitDate(e.value);
    }

    const onRiskFreeInitialDateChange = (e) => {
        dt.current.filter(e.value, 'riskFreeInitialDate', 'custom');
        setSelectedRiskFreeInitialDate(e.value);
    }

    const onRiskFreeHitDateChange = (e) => {
        dt.current.filter(e.value, 'riskFreeHitDate', 'custom');
        setSelectedRiskFreeHitDate(e.value);
    }

    const onRegisteredInMarketChange = (e) => {
        dt.current.filter(e.value, 'registeredInMarket', 'equals');
        setSelectedRegisteredInMarket(e.value);
    }

    const onIsReviewedChange = (e) => {
        dt.current.filter(e.value, 'isReviewed', 'equals');
        setSelectedIsReviewed(e.value);
    }

    const onHasPatternChange = (e) => {
        dt.current.filter(e.value, 'hasPattern', 'equals');
        setSelectedHasPattern(e.value);
    }

    const onIsConfirmedChange = (e) => {
        dt.current.filter(e.value, 'isConfirmed', 'equals');
        setSelectedIsConfirmed(e.value);
    }

    const onHasProperOverlapChange = (e) => {
        dt.current.filter(e.value, 'hasProperOverlap', 'equals');
        setSelectedHasProperOverlap(e.value);
    }

    const onHasProperElongationChange = (e) => {
        dt.current.filter(e.value, 'hasProperElongation', 'equals');
        setSelectedHasProperElongation(e.value);
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

    const onNumericFilterClear = (name) => {
        var temp = { ...numericColumnComparisonType };
        temp[name] = '';
        setNumericColumnComparisonType(temp);
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

    /*********** Start Text Filter ***********/
    const onTextFilter = () => {
        var temp = { ...textColumnComparisonType };
        temp[displayTextColumnFilter] = selectedTextFilterType;
        setTextColumnComparisonType(temp);

        if (selectedTextFilterValue === null || selectedTextFilterValue === undefined || selectedTextFilterValue === '')
            dt.current.filter('***#undefined#***', displayTextColumnFilter, 'custom');
        else
            dt.current.filter(selectedTextFilterValue, displayTextColumnFilter, 'custom');
        setSelectedTextFilterValue('');
        setSelectedTextFilterType(null);
        onTextFilterHide();
    }

    const onTextFilterClear = (name) => {
        var temp = { ...textColumnComparisonType };
        temp[name] = '';
        setTextColumnComparisonType(temp);
        dt.current.filter(null, name, 'custom');
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
    /*********** End String Filter ***********/

    const reset = () => {
        setSelectedSymbols(null);
        setSelectedInterval(null);
        setSelectedDivergenceStartDate(null);
        setSelectedDivergenceEndDate(null);
        setSelectedRefCandleDate(null);
        setSelectedTriggerDate(null);
        setSelectedExitDate(null);
        setSelectedRegisteredInMarket(null);
        setSelectedHasPattern(null);
        setNumericColumnComparisonType({
            order: '',
            rewardToRisk: '',
            trigger: '',
            calculatedRiskFree: '',
            actualRiskFree: '',
            stopLoss: '',
            target: '',
            customStopTrailRewardToRisk: '',
            customStopTrailCommission: '',
            customStopTrailPureRewardToRisk: '',
            positionDurationInMinutes: '',
            quantityToTrade: '',
            depositNeeded: '',
            balanceBeforeDeposit: '',
            withdraw: '',
            balanceAfterExit: '',
            leverage: '',
            commissionR: '',
            id: '',
            histogramNumberBasedOnRefCandle: '',
            histogramNumberBasedOnLivePrice: '',
            histogramNumberBasedOnLiveMacd: '',
            rewardToRiskPure: '',
            exchangeRewardToRisk: '',
            exchangeRewardToRiskPure: '',
            exchangeProfit: '',
            exchangeCommission: '',
            exchangeBalanceBeforePosition: '',
            usdtEnterCommissionFee: '',
            usdtExitCommissionFee: '',
            assetValueInUsdt: '',
            refCandleOpen: '',
            refCandleClose: '',
            refCandleHigh: '',
            refCandleLow: '',
            stopTrailTarget: '',
            stopTrailStop: '',
            stopTrailLevel: '',
            refCandleShadowsDifference: '',
            refCandleBodyRatio: '',
            slowCorrectionElongation: '',
            maxRewardToRisk: '',
            potentialRewardToRisk: '',
            stopTrailRewardToRisk: '',
            pattern3Value: '',
            strategyId: '',
            simulationId: '',
            exchangeAccountId: '',
            exchangePnl: '',
            exchangeUsdtCommission: '',
            exchangeCommissionR: '',
            refCandleLowerShadow: '',
            refCandleUpperShadow: '',
            exitAssetValueInUsdt: '',
            enterAssetValueInUsdt: '',
            calculatedTrigger: '',
            actualTrigger: '',
            calculatedStopLoss: '',
            actualStopLoss: '',
            calculatedTarget: '',
            actualTarget: '',
            actualQuantityToTrade: '',
            actualProfitAndLoss: '',
            calculatedQuantityToTrade: '',
            balanceBeforeOrder: '',
            calculatedWithdraw: '',
            actualWithdraw: '',
            actualEnterCommissionFee: '',
            actualExitCommissionFee: '',
            calculatedTriggerCommissionFee: '',
            calculatedStopLossCommissionFee: '',
            calculatedTargetCommissionFee: '',
            calculatedProfitAndLoss: '',
            calculatedCommissionFee: '',
            calculatedExitPrice: '',
            actualExitPrice: '',
            targetRewardToRisk: '',
            calculatedRewardToRisk: '',
            actualRewardToRisk: '',
            risk: '',
            calculatedBalanceAfterPosition: '',
            actualBalanceAfterPosition: '',
            distanceFromPeakPercentage: '',
            candleSizeAverageFromPeak: '',
            refCandleToCandlesAverageSizeRatio: ''
        });
        setTextColumnComparisonType({
            divergenceType: '',
            positionType: '',
            exitReason: '',
            reasonToNotEnter: '',
            marketTradeId: '',
            takeProfitTradeId: '',
            stopMarketTradeId: '',
            riskFreeOrderId: '',
            txId: '',
            marketOrderClientId: '',
            takeProfitOrderClientId: '',
            riskFreeOrderClientId: '',
            stopMarketOrderClientId: '',
            commissionAsset: '',
            onePhaseDivergence: '',
            twoPhasesDivergence: '',
            refCandlePatternString: '',
            lowerTimeFrameOnePhaseDivergence: '',
            lowerTimeFrameTwoPhasesDivergence: '',
            scriptVersion: '',
            analyticalStopLoss: '',
            simulationName: '',
            strategyName: '',
        });
        setGlobalFilter('');
        setFilteredColumns([]);
        setDatatableFilters([]);
        dt.current.reset();
    }

    const onCustomFilter = (ev) => {
        setFilteredColumns(Object.keys(ev.filters));
        setDatatableFilters(ev.filters);
    }

    const symbolFilter = <MultiSelect value={selectedSymbols} options={symbols} onChange={onSymbolChange} placeholder="Select a Symbol" className="p-column-filter multiselect-custom" filter showClear />;
    const timeFrameFilter = <Dropdown value={selectedInterval} options={intervals} onChange={onIntervalChange} placeholder="Select a Time Frame" className="p-column-filter" filter showClear />;
    const divergenceStartDateFilter = <Calendar value={selectedDivergenceStartDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceStartDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const divergenceEndDateFilter = <Calendar value={selectedDivergenceEndDate} selectionMode="range" showIcon showButtonBar onChange={onDivergenceEndDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const refCandleDateFilter = <Calendar value={selectedRefCandleDate} selectionMode="range" showIcon showButtonBar onChange={onRefCandleDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const triggerDateFilter = <Calendar value={selectedTriggerDate} selectionMode="range" showIcon showButtonBar onChange={onTriggerDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const exitDateFilter = <Calendar value={selectedExitDate} selectionMode="range" showIcon showButtonBar onChange={onExitDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const riskFreeInitialDateFilter = <Calendar value={selectedRiskFreeInitialDate} selectionMode="range" showIcon showButtonBar onChange={onRiskFreeInitialDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const riskFreeHitDateFilter = <Calendar value={selectedRiskFreeHitDate} selectionMode="range" showIcon showButtonBar onChange={onRiskFreeHitDateChange} dateFormat="dd/mm/yy" showTime showSeconds />
    const registeredInMarketFilter = <Dropdown value={selectedRegisteredInMarket} options={booleanSelection} filter showClear onChange={onRegisteredInMarketChange} placeholder="Choose filter" />
    const isReviewedFilter = <Dropdown value={selectedIsReviewed} options={booleanSelection} filter showClear onChange={onIsReviewedChange} placeholder="Choose filter" />
    const isConfirmedFilter = <Dropdown value={selectedIsConfirmed} options={booleanSelection} filter showClear onChange={onIsConfirmedChange} placeholder="Choose filter" />
    const hasProperOverlapFilter = <Dropdown value={selectedHasProperOverlap} options={booleanSelection} filter showClear onChange={onHasProperOverlapChange} placeholder="Choose filter" />
    const hasProperElongationFilter = <Dropdown value={selectedHasProperElongation} options={booleanSelection} filter showClear onChange={onHasProperElongationChange} placeholder="Choose filter" />

    const hasPatternFilter = <Dropdown value={selectedHasPattern} options={booleanSelection} filter showClear onChange={onHasPatternChange} placeholder="Choose filter" />
    const calculatedRiskFreeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedRiskFree', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedRiskFree')} />
        </span>
    const actualRiskFreeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualRiskFree', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualRiskFree')} />
        </span>
    const positionDurationInMinutesFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('positionDurationInMinutes', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('positionDurationInMinutes')} />
        </span>
    const quantityToTradeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('quantityToTrade', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('quantityToTrade')} />
        </span>
    const depositNeededFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('depositNeeded', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('depositNeeded')} />
        </span>
    const balanceBeforeDepositFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('balanceBeforeDeposit', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('balanceBeforeDeposit')} />
        </span>
    const withdrawFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('withdraw', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('withdraw')} />
        </span>
    const realWithdrawFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('realWithdraw', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('realWithdraw')} />
        </span>
    const balanceAfterExitFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('balanceAfterExit', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('balanceAfterExit')} />
        </span>
    const idFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('id', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('id')} />
        </span>
    const leverageFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('leverage', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('leverage')} />
        </span>
    const divergenceTypeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('divergenceType')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('divergenceType')} />
        </span>
    const positionTypeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('positionType')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('positionType')} />
        </span>
    const exitReasonFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('exitReason')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('exitReason')} />
        </span>
    const reasonToNotEnterFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('reasonToNotEnter')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('reasonToNotEnter')} />
        </span>
    const histogramNumberBasedOnRefCandleFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('histogramNumberBasedOnRefCandle', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('histogramNumberBasedOnRefCandle')} />
        </span>
    const histogramNumberBasedOnLivePriceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('prerequisite.histogramNumberBasedOnLivePrice', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('prerequisite.histogramNumberBasedOnLivePrice')} />
        </span>
    const histogramNumberBasedOnLiveMacdFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('prerequisite.histogramNumberBasedOnLiveMacd', 'integer')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('prerequisite.histogramNumberBasedOnLiveMacd')} />
        </span>
    const candleSizeAverageFromPeakFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('prerequisite.candleSizeAverageFromPeak', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('prerequisite.candleSizeAverageFromPeak')} />
        </span>
    const refCandleToCandlesAverageSizeRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleToCandlesAverageSizeRatio', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleToCandlesAverageSizeRatio')} />
        </span>
    const distanceFromPeakPercentageFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('prerequisite.distanceFromPeakPercentage', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('prerequisite.distanceFromPeakPercentage')} />
        </span>
    const rewardToRiskPureFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('rewardToRiskPure', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('rewardToRiskPure')} />
        </span>
    const refCandleOpenFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleOpen', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleOpen')} />
        </span>
    const refCandleCloseFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleClose', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleClose')} />
        </span>
    const refCandleHighFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleHigh', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleHigh')} />
        </span>
    const refCandleLowFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleLow', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleLow')} />
        </span>
    const onePhaseDivergenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('onePhaseDivergence')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('onePhaseDivergence')} />
        </span>
    const twoPhasesDivergenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('twoPhasesDivergence')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('twoPhasesDivergence')} />
        </span>

    const refCandleShadowsDifferenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleShadowsDifference', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleShadowsDifference')} />
        </span>
    const refCandleBodyRatioFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleBodyRatio', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleBodyRatio')} />
        </span>
    const refCandlePatternStringFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('refCandlePatternString')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('refCandlePatternString')} />
        </span>
    const slowCorrectionElongationFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('slowCorrectionElongation', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('slowCorrectionElongation')} />
        </span>
    const potentialRewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('potentialRewardToRisk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('potentialRewardToRisk')} />
        </span>

    const lowerTimeFrameOnePhaseDivergenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('lowerTimeFrameOnePhaseDivergence')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('lowerTimeFrameOnePhaseDivergence')} />
        </span>
    const lowerTimeFrameTwoPhasesDivergenceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('lowerTimeFrameTwoPhasesDivergence')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('lowerTimeFrameTwoPhasesDivergence')} />
        </span>
    const scriptVersionFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('scriptVersion')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('scriptVersion')} />
        </span>
    const refCandleLowerShadowFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleLowerShadow', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleLowerShadow')} />
        </span>
    const refCandleUpperShadowFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('refCandleUpperShadow', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('refCandleUpperShadow')} />
        </span>
    const strategyNameFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('strategyName')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('strategyName')} />
        </span>
    const simulationNameFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onTextFilterOpen('simulationName')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onTextFilterClear('simulationName')} />
        </span>
    const calculatedTriggerFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedTrigger', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedTrigger')} />
        </span>
    const actualTriggerFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualTrigger', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualTrigger')} />
        </span>
    const calculatedStopLossFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedStopLoss', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedStopLoss')} />
        </span>
    const actualStopLossFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualStopLoss', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualStopLoss')} />
        </span>
    const calculatedTargetFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedTarget', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedTarget')} />
        </span>
    const actualTargetFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualTarget', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualTarget')} />
        </span>
    const actualQuantityToTradeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualQuantityToTrade', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualQuantityToTrade')} />
        </span>
    const actualProfitAndLossFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualProfitAndLoss', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualProfitAndLoss')} />
        </span>
    const calculatedQuantityToTradeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedQuantityToTrade', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedQuantityToTrade')} />
        </span>
    const balanceBeforeOrderFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('balanceBeforeOrder', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('balanceBeforeOrder')} />
        </span>
    const calculatedWithdrawFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedWithdraw', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedWithdraw')} />
        </span>
    const actualWithdrawFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualWithdraw', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualWithdraw')} />
        </span>
    const actualEnterCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualEnterCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualEnterCommissionFee')} />
        </span>
    const actualExitCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualExitCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualExitCommissionFee')} />
        </span>
    const calculatedTriggerCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedTriggerCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedTriggerCommissionFee')} />
        </span>
    const calculatedStopLossCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedStopLossCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedStopLossCommissionFee')} />
        </span>
    const calculatedTargetCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedTargetCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedTargetCommissionFee')} />
        </span>
    const calculatedProfitAndLossFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedProfitAndLoss', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedProfitAndLoss')} />
        </span>
    const calculatedCommissionFeeFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedCommissionFee', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedCommissionFee')} />
        </span>
    const calculatedExitPriceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedExitPrice', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedExitPrice')} />
        </span>
    const actualExitPriceFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualExitPrice', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualExitPrice')} />
        </span>
    const targetRewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('targetRewardToRisk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('targetRewardToRisk')} />
        </span>
    const calculatedRewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedRewardToRisk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedRewardToRisk')} />
        </span>
    const actualRewardToRiskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualRewardToRisk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualRewardToRisk')} />
        </span>

    const riskFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('risk', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('risk')} />
        </span>
    const calculatedBalanceAfterPositionFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('calculatedBalanceAfterPosition', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('calculatedBalanceAfterPosition')} />
        </span>
    const actualBalanceAfterPositionFilter =
        <span className="flex filterButtons">
            <Button icon="pi pi-filter" className="p-button-info p-button-outlined" onClick={() => onNumericFilterOpen('actualBalanceAfterPosition', 'decimal')} />
            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => onNumericFilterClear('actualBalanceAfterPosition')} />
        </span>

    const linkedSymbolTemplate = (rowData) => {
        return <a href={`${window.location.origin}/chart?id=${rowData.id}&type=position`}>{rowData.symbol}</a>
    }

    const strategyNameBodyTemplate = (rowData) => {
        if (rowData.strategyId) {
            var find = strategyNames.find(x => x.value === rowData.strategyId);
            return find?.label ?? "";
        }
        return "";
    }
    const strategyNameFilterTemplate = (temp, filterValue, temp2, data) => {
        let columnValue = "";
        if (data.rowData.strategyId) {
            var find = strategyNames.find(x => x.value === data.rowData.strategyId);
            columnValue = find?.label ?? "";
        }

        filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.strategyName)
    }

    const backtestNameBodyTemplate = (rowData) => {
        if (rowData.simulationId) {
            var find = backtestNames.find(x => x.value === rowData.simulationId);
            return find?.label ?? "";
        }
        return "";
    }
    const backtestNameFilterTemplate = (temp, filterValue, temp2, data) => {
        let columnValue = "";
        if (data.rowData.simulationId) {
            var find = backtestNames.find(x => x.value === data.rowData.simulationId);
            columnValue = find?.label ?? "";
        }

        filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.simulationName)
    }
    const columns = [];
    columns.push(
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: !isChart,
            columnKey: "toggleVisibility",
            style: { 'minWidth': '50px', width: '50px' },
            body: visibilityTemplate,
            header: visibilityHeaderTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: !isChart,
            columnKey: "actions",
            header: "Actions",
            body: actionBodyTemplateScalp,
            style: { 'minWidth': '50px', width: '120px' },
            bodyStyle: { justifyContent: 'center', overflow: 'visible' }
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: isChart,
            reorderable: false,
            columnKey: "multipleSelection",
            selectionMode: "multiple",
            style: { width: '3em' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "id",
            header: "Id",
            sortable: true,
            filter: filter,
            filterElement: idFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.id),
            style: { 'minWidth': '50px', width: '80px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "symbol",
            header: "Symbol",
            sortable: true,
            filter: filter,
            filterElement: symbolFilter,
            body: isChart ? null : linkedSymbolTemplate,
            style: { 'minWidth': '50px', width: '120px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "isReviewed",
            header: "Is Reviewed",
            sortable: true,
            filter: filter,
            filterElement: isReviewedFilter,
            body: templates.booleanBodyTemplate,
            bodyStyle: { justifyContent: 'center' },
            style: { 'minWidth': '50px', width: '80px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "timeFrameStr",
            header: "Time Frame",
            sortable: true,
            filter: filter,
            filterElement: timeFrameFilter,
            style: { 'minWidth': '50px', width: '110px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "triggerDate",
            header: "Trigger Date",
            sortable: true,
            filter: filter,
            filterElement: triggerDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "exitDate",
            header: "Exit Date",
            filter: filter,
            filterElement: exitDateFilter,
            filterFunction: filterHelper.filterDate,
            sortable: true,
            sortFunction: (event) => sortHelper.sort(event, positions),
            body: templates.dateBodyTemplate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "reasonToNotEnter",
            header: "Reason To Not Enter",
            sortable: true,
            filter: filter,
            filterElement: reasonToNotEnterFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.reasonToNotEnter),
            style: { 'minWidth': '50px', width: '150px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "quantityToTrade",
            header: "Quantity To Trade",
            sortable: true,
            filter: filter,
            filterElement: quantityToTradeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.quantityToTrade),
            style: { 'minWidth': '50px', width: '120px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "registeredInMarket",
            header: "Registered In Market",
            sortable: true,
            filter: filter,
            filterElement: registeredInMarketFilter,
            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' },
            body: templates.booleanBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "divergenceStartDate",
            header: "Div Start",
            sortable: true,
            filter: filter,
            filterElement: divergenceStartDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "divergenceEndDate",
            header: "Div End",
            sortable: true,
            filter: filter,
            filterElement: divergenceEndDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleDate",
            header: "Ref Candle",
            sortable: true,
            filter: filter,
            filterElement: refCandleDateFilter,
            body: templates.dateBodyTemplate,
            filterFunction: filterHelper.filterDate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "divergenceType",
            header: "Div Type",
            sortable: true,
            filter: filter,
            filterElement: divergenceTypeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.divergenceType),
            style: { 'minWidth': '50px', width: '50px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "positionType",
            header: "Position Type",
            sortable: true,
            filter: filter,
            filterElement: positionTypeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.positionType),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "exitReason",
            header: "Exit Reason",
            sortable: true,
            filter: filter,
            filterElement: exitReasonFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.exitReason),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "positionDurationInMinutes",
            header: "Position Duration",
            sortable: true,
            filter: filter,
            filterElement: positionDurationInMinutesFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.positionDurationInMinutes),
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "depositNeeded",
            header: "Deposit",
            sortable: true,
            filter: filter,
            filterElement: depositNeededFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.depositNeeded),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "leverage",
            header: "Leverage",
            sortable: true,
            filter: filter,
            filterElement: leverageFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.leverage),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "isConfirmed",
            header: "Is Confirmed",
            filter: filter,
            filterElement: isConfirmedFilter,
            sortable: true,
            body: templates.booleanBodyTemplate,
            bodyStyle: { justifyContent: 'center' },
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "histogramNumberBasedOnRefCandle",
            header: "Histogram Number Based On Ref Candle",
            sortable: true,
            filter: filter,
            filterElement: histogramNumberBasedOnRefCandleFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.histogramNumberBasedOnRefCandle),
            style: { 'minWidth': '50px', width: '111px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.histogramNumberBasedOnLivePrice",
            header: "Histogram Number Based On Live Price",
            sortable: true,
            filter: filter,
            filterElement: histogramNumberBasedOnLivePriceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.histogramNumberBasedOnLivePrice),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.histogramNumberBasedOnLiveMacd",
            header: "Histogram Number Based On Live Macd",
            sortable: true,
            filter: filter,
            filterElement: histogramNumberBasedOnLiveMacdFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.histogramNumberBasedOnLiveMacd),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.distanceFromPeakPercentage",
            header: "Distance From Peak Percentage",
            sortable: true,
            filter: filter,
            filterElement: distanceFromPeakPercentageFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.distanceFromPeakPercentage),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.candleSizeAverageFromPeak",
            header: "Candle Size Average From Peak",
            sortable: true,
            filter: filter,
            filterElement: candleSizeAverageFromPeakFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.candleSizeAverageFromPeak),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleToCandlesAverageSizeRatio",
            header: "RefCandle To Candles Average Size Ratio",
            sortable: true,
            filter: filter,
            filterElement: refCandleToCandlesAverageSizeRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleToCandlesAverageSizeRatio),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '100px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleOpen",
            header: "Ref Candle Open",
            sortable: true,
            filter: filter,
            filterElement: refCandleOpenFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleOpen),
            style: { 'minWidth': '50px', width: '80px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleClose",
            header: "Ref Candle Close",
            sortable: true,
            filter: filter,
            filterElement: refCandleCloseFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleClose),
            style: { 'minWidth': '50px', width: '80px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleHigh",
            header: "Ref Candle High",
            sortable: true,
            filter: filter,
            filterElement: refCandleHighFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleHigh),
            style: { 'minWidth': '50px', width: '80px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleLow",
            header: "Ref Candle Low",
            sortable: true,
            filter: filter,
            filterElement: refCandleLowFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleLow),
            style: { 'minWidth': '50px', width: '80px' },
            body: templates.digitBodyTemplate,
        },
        {
            ...columnHelper.defaultColumn,
            field: "onePhaseDivergence",
            header: "One Phase Divergence",
            sortable: true,
            filter: filter,
            filterElement: onePhaseDivergenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.onePhaseDivergence),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "twoPhasesDivergence",
            header: "Two Phases Divergence",
            sortable: true,
            filter: filter,
            filterElement: twoPhasesDivergenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.twoPhasesDivergence),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleShadowsDifference",
            header: "Ref Candle Shadows Difference",
            sortable: true,
            filter: filter,
            filterElement: refCandleShadowsDifferenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleShadowsDifference),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleBodyRatio",
            header: "Ref Candle Body Ratio",
            sortable: true,
            filter: filter,
            filterElement: refCandleBodyRatioFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleBodyRatio),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandlePatternString",
            header: "Ref Candle Pattern",
            sortable: true,
            filter: filter,
            filterElement: refCandlePatternStringFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.refCandlePatternString),
            style: { 'minWidth': '50px', width: '80px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.slowCorrectionElongation",
            header: "Slow Correction Elongation",
            sortable: true,
            filter: filter,
            filterElement: slowCorrectionElongationFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.slowCorrectionElongation),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.hasProperElongation",
            header: "Has Proper Elongation",
            sortable: true,
            filter: filter,
            filterElement: hasProperElongationFilter,
            body: templates.booleanBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.hasProperOverlap",
            header: "Has Proper Overlap",
            sortable: true,
            filter: filter,
            filterElement: hasProperOverlapFilter,
            body: templates.booleanBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "potentialRewardToRisk",
            header: "Potential R/R",
            sortable: true,
            filter: filter,
            filterElement: potentialRewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.potentialRewardToRisk),
            body: templates.digitBodyTemplate,
            style: { 'minWidth': '50px', width: '80px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.lowerTimeFrameOnePhaseDivergence",
            header: "Lower Time Frame One Phase Divergence",
            sortable: true,
            filter: filter,
            body: templates.commaBodyTemplate,
            filterElement: lowerTimeFrameOnePhaseDivergenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.lowerTimeFrameOnePhaseDivergence),
            style: { 'minWidth': '50px', width: '180px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "prerequisite.lowerTimeFrameTwoPhasesDivergence",
            header: "Lower Time Frame Two Phases Divergence",
            sortable: true,
            filter: filter,
            body: templates.commaBodyTemplate,
            filterElement: lowerTimeFrameTwoPhasesDivergenceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.lowerTimeFrameTwoPhasesDivergence),
            style: { 'minWidth': '50px', width: '180px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "candlestickPattern",
            header: "Candlestick Pattern",
            sortable: true,
            style: { 'minWidth': '50px', width: '100px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "strategyName",
            header: "Strategy Name",
            sortable: true,
            filter: filter,
            body: strategyNameBodyTemplate,
            filterElement: strategyNameFilter,
            filterFunction: strategyNameFilterTemplate,
            style: { 'minWidth': '50px', width: '150px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "simulationName",
            header: "Backtest Name",
            sortable: true,
            filter: filter,
            body: backtestNameBodyTemplate,
            filterElement: simulationNameFilter,
            filterFunction: backtestNameFilterTemplate,
            style: { 'minWidth': '50px', width: '150px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "hasPattern",
            header: "Has Pattern",
            sortable: true,
            filter: filter,
            body: templates.booleanBodyTemplate,
            filterElement: hasPatternFilter,
            style: { 'minWidth': '50px', width: '100px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleLowerShadow",
            header: "Ref Candle Lower Shadow",
            sortable: true,
            filter: filter,
            body: templates.digitBodyTemplate,
            filterElement: refCandleLowerShadowFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleLowerShadow),
            style: { 'minWidth': '50px', width: '100px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "refCandleUpperShadow",
            header: "Ref Candle Upper Shadow",
            sortable: true,
            filter: filter,
            body: templates.digitBodyTemplate,
            filterElement: refCandleUpperShadowFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.refCandleUpperShadow),
            style: { 'minWidth': '50px', width: '100px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "scriptVersion",
            header: "Bot Version",
            sortable: true,
            filter: filter,
            filterElement: scriptVersionFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterText(columnValue, filterValue, textColumnComparisonType.scriptVersion),
            style: { 'minWidth': '50px', width: '100px' },
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedTrigger",
            header: "Calculated Trigger",
            sortable: true,
            filter: filter,
            filterElement: calculatedTriggerFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedTrigger),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualTrigger",
            header: "Actual Trigger",
            sortable: true,
            filter: filter,
            filterElement: actualTriggerFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualTrigger),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedStopLoss",
            header: "Calculated Stop Loss",
            sortable: true,
            filter: filter,
            filterElement: calculatedStopLossFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedStopLoss),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualStopLoss",
            header: "Actual Stop Loss",
            sortable: true,
            filter: filter,
            filterElement: actualStopLossFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualStopLoss),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedTarget",
            header: "Calculated Target",
            sortable: true,
            filter: filter,
            filterElement: calculatedTargetFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedTarget),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualTarget",
            header: "Actual Target",
            sortable: true,
            filter: filter,
            filterElement: actualTargetFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualTarget),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedQuantityToTrade",
            header: "Calculated Quantity to Trade",
            sortable: true,
            filter: filter,
            filterElement: calculatedQuantityToTradeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedQuantityToTrade),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualQuantityToTrade",
            header: "Actual Quantity to Trade",
            sortable: true,
            filter: filter,
            filterElement: actualQuantityToTradeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualQuantityToTrade),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "balanceBeforeOrder",
            header: "Balance Before Order",
            sortable: true,
            filter: filter,
            filterElement: balanceBeforeOrderFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.balanceBeforeOrder),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedProfitAndLoss",
            header: "Calculated PnL",
            sortable: true,
            filter: filter,
            filterElement: calculatedProfitAndLossFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedProfitAndLoss),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualProfitAndLoss",
            header: "Actual PnL",
            sortable: true,
            filter: filter,
            filterElement: actualProfitAndLossFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualProfitAndLoss),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualEnterCommissionFee",
            header: "Actual Enter Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: actualEnterCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualEnterCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualExitCommissionFee",
            header: "Actual Exit Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: actualExitCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualExitCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualWithdraw",
            header: "Actual Withdraw",
            sortable: true,
            filter: filter,
            filterElement: actualWithdrawFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualWithdraw),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedWithdraw",
            header: "Calculated Withdraw",
            sortable: true,
            filter: filter,
            filterElement: calculatedWithdrawFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedWithdraw),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedCommissionFee",
            header: "Calculated Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: calculatedCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedTriggerCommissionFee",
            header: "Calculated Trigger Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: calculatedTriggerCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedTriggerCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedStopLossCommissionFee",
            header: "Calculated Stop Loss Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: calculatedStopLossCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedStopLossCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedTargetCommissionFee",
            header: "Calculated Target Commission Fee",
            sortable: true,
            filter: filter,
            filterElement: calculatedTargetCommissionFeeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedTargetCommissionFee),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedExitPrice",
            header: "Calculated Exit Price",
            sortable: true,
            filter: filter,
            filterElement: calculatedExitPriceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedExitPrice),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualExitPrice",
            header: "Actual Exit Price",
            sortable: true,
            filter: filter,
            filterElement: actualExitPriceFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualExitPrice),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "targetRewardToRisk",
            header: "Target R/R",
            sortable: true,
            filter: filter,
            filterElement: targetRewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.targetRewardToRisk),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedRewardToRisk",
            header: "Calculated R/R",
            sortable: true,
            filter: filter,
            filterElement: calculatedRewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedRewardToRisk),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualRewardToRisk",
            header: "Actual R/R",
            sortable: true,
            filter: filter,
            filterElement: actualRewardToRiskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualRewardToRisk),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "risk",
            header: "Risk",
            sortable: true,
            filter: filter,
            filterElement: riskFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.risk),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedBalanceAfterPosition",
            header: "Calculated Balance After Position",
            sortable: true,
            filter: filter,
            filterElement: calculatedBalanceAfterPositionFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.calculatedBalanceAfterPosition),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: positionType === 'backtest',
            field: "actualBalanceAfterPosition",
            header: "Actual Balance After Position",
            sortable: true,
            filter: filter,
            filterElement: actualBalanceAfterPositionFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.actualBalanceAfterPosition),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: !isChart,
            field: "prerequisiteId",
            header: "Prerequisite",
            sortable: true,
            body: prerequisiteTemplate,
            style: { 'minWidth': '50px', width: '100px' },
            bodyStyle: { justifyContent: 'center' }
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: !isChart,
            columnKey: "maxRewardToRiskVisibility",
            style: { 'minWidth': '50px', width: '60px' },
            body: maxRewardToRiskVisibilityTemplate,
            header: "Max R/R Visibility Toggle",
        },
        {
            ...columnHelper.defaultColumn,
            ignoreOnGeneration: !isChart,
            columnKey: "potentialRewardToRiskVisibility",
            style: { 'minWidth': '50px', width: '60px' },
            body: potentialRewardToRiskVisibilityTemplate,
            header: "Potential R/R Visibility Toggle",
        },
        {
            ...columnHelper.defaultColumn,
            field: "calculatedRiskFree",
            header: "Calculated Risk Free Price",
            sortable: true,
            filter: filter,
            filterElement: calculatedRiskFreeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.riskFree),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "actualRiskFree",
            header: "Actual Risk Free Price",
            sortable: true,
            filter: filter,
            filterElement: actualRiskFreeFilter,
            filterFunction: (columnValue, filterValue) => filterHelper.filterNumeric(columnValue, filterValue, numericColumnComparisonType.riskFree),
            style: { 'minWidth': '50px', width: '100px' },
            body: templates.digitBodyTemplate
        },
        {
            ...columnHelper.defaultColumn,
            field: "riskFreeInitialDate",
            header: "Risk Free Initial Date",
            filter: filter,
            filterElement: riskFreeInitialDateFilter,
            filterFunction: filterHelper.filterDate,
            sortable: true,
            sortFunction: (event) => sortHelper.sort(event, positions),
            body: templates.dateBodyTemplate,
            style: { 'minWidth': '50px', width: '120px' }
        },
        {
            ...columnHelper.defaultColumn,
            field: "riskFreeHitDate",
            header: "Risk Free Hit Date",
            filter: filter,
            filterElement: riskFreeHitDateFilter,
            filterFunction: filterHelper.filterDate,
            sortable: true,
            sortFunction: (event) => sortHelper.sort(event, positions),
            body: templates.dateBodyTemplate,
            style: { 'minWidth': '50px', width: '120px' }
        },
    )

    const showOnChart = () => {
        if (selectedPositions && customRewardToRisk) {
            navigate('/chart', {
                state: {
                    positionsToShow: selectedPositions,
                    rewardToRisk: customRewardToRisk
                }
            });
        }
        else if (selectedPositions) {
            navigate('/chart', {
                state: {
                    positionsToShow: selectedPositions
                }
            });
        }
    }

    const excelHeaders = () => {
        var result = [];
        if (positions && positions[0]) {
            var keys = Object.keys(positions[0])
            for (let index = 0; index < keys.length; index++) {
                const element = keys[index];
                const found = columns.find(col => col.field === element);
                if (found && found.header)
                    result.push(found.header)
                else
                    result.push(element)
            }
        }
        return result;
    }

    const header = (
        isChart
            ? <div className="table-header-container flex flex-wrap align-items-center">
                <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(positions, "positions", excelHeaders())} className="p-button-info" data-pr-tooltip="XLS" />
                {location?.state?.rewardToRisk && <strong className="ml-2"><i className="pi pi-info-circle"></i> Attention: Positions colorize is based on potential r/r.</strong>}
                {message && <strong className="ml-2"><i className="pi pi-info-circle"></i> {message}</strong>}
                <ColumnManager columns={columns.filter(x => x.isHide !== true)} dataTableName={dataTableName} setSortState={setMultiSortMeta}
                    onSave={() => setPositions(prevState => [...prevState])} buttonClassNames="ml-auto" />
            </div>
            : <div className="table-header-container flex-wrap align-items-center">
                <Button icon="pi pi-chart-bar" label="Show on chart" id='showChart' className="p-button-success mr-2" onClick={showOnChart} />
                <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(positions, "positions", excelHeaders())} className="p-button-info" data-pr-tooltip="XLS" />
                {message && <strong className="ml-2"><i className="pi pi-info-circle"></i> {message}</strong>}
                <div className="filter-container">
                    <Button type="button" label="Clear" className="p-button-outlined" icon="pi pi-filter-slash" onClick={reset} />
                    <span className="flex p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                    </span>
                </div>
                <ColumnManager columns={columns.filter(x => x.isHide !== true)} dataTableName={dataTableName} setSortState={setMultiSortMeta}
                    onSave={() => setPositions(prevState => [...prevState])} />
            </div>
    );

    const colorizeRow = (rowData) => {
        if (rowData.registeredInMarket) {
            if (rowData.rewardToRisk > 0)
                return { 'succeed': true }
            else if (rowData.rewardToRisk < 0)
                return { 'failed': true }
        }
    }

    if (ref)
        ref.current = {};

    return (
        <div id="positions-component-container">
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
            <div className="card">
                <Paginator ref={pg} setFirst={setFirst} setRows={setRows} />
                <DataTable ref={dt} value={positions} className={"p-datatable-sm"} scrollable showGridlines filterDisplay={isChart ? "" : "row"} scrollDirection="both"
                    multiSortMeta={multiSortMeta} selection={selectedPositions} onSelectionChange={e => setSelectedPositions(e.value)}
                    onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    loading={loading} header={header} paginator globalFilter={globalFilter} scrollHeight="550px"
                    paginatorTemplate={pg.current?.paginatorTemplate} first={first} rows={rows} onPage={pg.current?.onPage}
                    contextMenuSelection={selectedContent} sortMode="multiple" rowClassName={customColorizeRow ?? colorizeRow}
                    onContextMenuSelectionChange={e => setSelectedContent(e)} filters={datatableFilters} onFilter={onCustomFilter}
                    cellClassName={(data, options) => options.field}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns.filter(x => x.isHide !== true), tableStateName, filteredColumns)}

                </DataTable>
            </div>
        </div>
    )
}

PositionTable.prototype = {
    hasStopTrailColumns: PropTypes.bool,
    positions: PropTypes.array,
    setPositions: PropTypes.func,
    customColorizeRow: PropTypes.func,
    loading: PropTypes.bool,
    tableStateName: PropTypes.string,
    message: PropTypes.string,
    dataTableName: PropTypes.string,
    customRewardToRisk: PropTypes.number,
    ref: PropTypes.object,
}

export default React.forwardRef(PositionTable)