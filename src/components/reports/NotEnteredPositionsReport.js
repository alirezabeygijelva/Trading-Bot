import React from 'react';
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
import FiltersStatement from '../FiltersStatement';
import { IntervalHelper } from '../../utils/IntervalHelper';
import { InputNumber } from 'primereact/inputnumber';

//REPORT 8 (Statistical)
const NotEnteredPositionsReport = () => {
    const state = window.localStorage.getItem("server-filters-not-entered");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const dt = React.useRef(null);
    const cm = React.useRef(null);
    const [loading, setLoading] = React.useState(false);
    const [selectedContent, setSelectedContent] = React.useState(null);
    const [reportData, setReportData] = React.useState({});
    const [symbols, setSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [exchangeSymbols, setExchangeSymbols] = React.useState([]);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = React.useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = React.useState(filtersDefValue.timeFrame);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [selectedServerRewardToRiskTolerance, setSelectedServerRewardToRiskTolerance] = React.useState(filtersDefValue.rewardToRiskTolerance);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [selectedServerStartDate, setSelectedServerStartDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'years').toDate())
    );
    const [selectedServerStartTime, setSelectedServerStartTime] = React.useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = React.useState(
        dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
    );
    const [selectedServerEndTime, setSelectedServerEndTime] = React.useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [multiSortMeta, setMultiSortMeta] = React.useState([]);

    const menuModel = [
        {
            label: 'Copy Content',
            icon: 'pi pi-fw pi-cpoy',
            command: () => contentHelper.copy(selectedContent?.innerText)
        }
    ];

    const intervals = IntervalHelper.intervalsList();

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
        setFilterStatement(filtersStatement);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedServerStrategies, selectedServerBacktests, selectedServerSymbols, selectedServerInterval, selectedServerStartDate
        , selectedServerEndDate, selectedServerReasonsToNotEnter, selectedServerRewardToRiskTolerance]);

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

        scalpServices.getNotEnteredPositionsReport(strategies, backtests, symbols, selectedServerInterval, start, end
            , selectedServerReasonsToNotEnter, selectedServerRewardToRiskTolerance).then(data => {
                setReportData(data);
                setLoading(false);
            });
    }

    //DELETED FOR CLIENT VERSION
    // const footer = `Total Pure R/R Sum: ${contentHelper.digitFormat(reportData.pureRewardToRiskSum ?? 0, 2)}`;
    const footer = `Total R/R Sum: ${contentHelper.digitFormat(reportData.rewardToRiskSum ?? 0, 2)}`;

    // const showOnChart = (positions) => {
    //     if (positions) {
    //         navigate('/chart',{
    //             state: { positionsToShow: positions }
    //         });
    //     }
    // }

    // const actionBodyTemplate = (rowData) => {
    //     return (
    //         <Button icon="pi pi-chart-bar" title="Show on chart" id='showChart' className="p-button-rounded p-button-outlined p-button-success mr-2" onClick={() => showOnChart(rowData.positions)} />
    //     );
    // }

    const columns = [
        {
            ...columnHelper.defaultColumn,
            field: "reason",
            header: "Reason",
            sortable: true,
            className: "text-center",
            style: { 'minWidth': '50px', width: '120px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "count",
            header: "Count",
            sortable: true,
            className: "text-center",
            style: { 'minWidth': '50px', width: '80px' }
        },

        {
            ...columnHelper.defaultColumn,
            field: "winRatio",
            header: "Win Ratio",
            sortable: true,
            className: "text-center",
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '80px' }
        },

        //DELETED FOR CLIENT VERSION
        // {
        //     ...columnHelper.defaultColumn,
        //     field: "pureRewardToRiskSum",
        //     header: "Pure R/R Sum",
        //     sortable: true,
        //     className: "text-center",
        //     body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
        //     style: { 'minWidth': '50px', width: '80px' }
        // },
        {
            ...columnHelper.defaultColumn,
            field: "rewardToRiskSum",
            header: "R/R Sum",
            sortable: true,
            className: "text-center",
            body: (rowData, raw) => templates.digitBodyTemplate(rowData, raw, 2),
            style: { 'minWidth': '50px', width: '80px' }
        },




        // {
        //     ...columnHelper.defaultColumn,
        //     columnKey: "actions",
        //     header: "Actions",
        //     body: actionBodyTemplate,
        //     style: { 'minWidth': '50px', width: '120px' },
        //     bodyStyle: { justifyContent: 'center', overflow: 'visible' }
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
    ]

    const header = (
        <div className="table-header-container align-items-baseline flex-wrap">
            <div className="table-header-container flex flex-wrap align-items-center">
                <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(reportData.reasonsCount, "not-entered-position")} className="p-button-info" data-pr-tooltip="XLS" />
                <ColumnManager columns={columns} dataTableName="dt-state-not-entered" setSortState={setMultiSortMeta}
                    onSave={() => setReportData(prevState => ({ ...prevState }))} buttonClassNames="ml-auto" />
            </div>
        </div>
    );
    return (
        <div id="not-entered-position-container">
            <Card style={{ width: '100%', marginBottom: '2em' }}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverStrategy" className="align-self-baseline">Strategy</label>
                        <MultiSelect id='serverStrategy' value={selectedServerStrategies} options={strategies} filter showClear
                            onChange={(e) => setSelectedServerStrategies(e.value)} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverBacktests" className="align-self-baseline">Backtests</label>
                        <MultiSelect id='serverBacktests' value={selectedServerBacktests} options={backtests} filter showClear
                            onChange={(e) => setSelectedServerBacktests(e.value)} placeholder="Select Versions" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverSymbol" className="align-self-baseline">Symbols</label>
                        <div className="w-full flex align-self-end">
                            <MultiSelect id='serverSymbol' value={selectedServerSymbols} options={symbols} filter showClear
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="w-full align-self-end" />
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
                        <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                            onChange={(e) => setSelectedServerInterval(e.value)} placeholder="Select a Time Frame" className="w-full align-self-end" />
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
                        <label htmlFor="serverRewardToRiskTolerance" className="align-self-baseline">R/R Tolerance</label>
                        <InputNumber id="serverRewardToRiskTolerance" value={selectedServerRewardToRiskTolerance} onValueChange={(e) => setSelectedServerRewardToRiskTolerance(e.value)}
                            mode="decimal" minFractionDigits={0} maxFractionDigits={4} showButtons className="w-full align-self-end" />
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-not-entered"
                            onSave={loadData} />
                    </div>
                    <FiltersStatement commonFiltersStatement={filterStatement} />
                </div>
            </Card>
            <Card style={{ width: '100%', marginBottom: '1em' }}>
                <Tooltip target=".tltip" mouseTrack mouseTrackLeft={50} />
                <div className="grid p-fluid flex-1 flex-wrap">
                    {/* DELETED FOR CLIENT VERSION  */}
                    {/* <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions Count" value={reportData.totalPositionsCount} />
                    </div> */}
                    <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Total Positions" value={reportData.totalPositionsCount} />
                    </div>
                    {(!selectedServerBacktests || selectedServerBacktests.length === 0) && <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Not Entered In Real Market" value={reportData.notEnteredInRealMarketCount} />
                    </div>}
                    {selectedServerBacktests && selectedServerBacktests.length !== 0 && <div className="col-12 md:col-6 lg:col-4">
                        <LabelWithValue className="p-inputgroup" displayText="Not Entered In Backtest" value={reportData.notEnteredInBacktestCount} />
                    </div>}
                    <div className="col-12 md:col-6 lg:col-4"></div>
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
                <DataTable ref={dt} value={reportData.reasonsCount} className={"p-datatable-sm"}
                    showGridlines scrollDirection="both"
                    loading={loading} header={header} rowHover={true}
                    contextMenuSelection={selectedContent} sortMode="multiple" footer={footer}
                    onContextMenuSelectionChange={e => setSelectedContent(e.originalEvent?.target)}
                    multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
                    onContextMenu={e => cm.current.show(e.originalEvent)}>

                    {columnHelper.generatColumns(columns, "dt-state-not-entered")}

                </DataTable>
            </div>
        </div>
    );
}
export default NotEnteredPositionsReport

