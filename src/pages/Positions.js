import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { scalpServices } from '../services/ScalpServices';
import { dateHelper } from '../utils/DateHelper';
import { visibilityDetector } from '../utils/VisibilityDetector';
import { FilterType } from '../utils/FilterType';
import { exchangeServices } from '../services/ExchangeServices';
import FilterManager from '../components/FilterManager';
import PositionTable from '../components/PositionTable';
import '../assets/scss/Positions.scss';
import { IntervalHelper } from '../utils/IntervalHelper';

const Positions = () => {
    const state = window.localStorage.getItem("server-filters-positions");
    var filtersDefValue = state ? JSON.parse(state) : {};
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [strategies, setStrategies] = React.useState([]);
    const [backtests, setBacktests] = React.useState([]);
    const [selectedServerStrategies, setSelectedServerStrategies] = React.useState([]);
    const [selectedServerBacktests, setSelectedServerBacktests] = React.useState([]);
    const [selectedServerSymbols, setSelectedServerSymbols] = useState(filtersDefValue.symbol ?? []);
    const [selectedServerInterval, setSelectedServerInterval] = useState(filtersDefValue.timeFrame);
    const [selectedServerIsRegisteredInMarket, setSelectedServerIsRegisteredInMarket] = useState(filtersDefValue.isRegisteredInMarket);
    const [selectedServerStartDate, setSelectedServerStartDate] = useState(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'days').toDate()));
    const [selectedServerStartTime, setSelectedServerStartTime] = useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
    const [selectedServerEndDate, setSelectedServerEndDate] = useState(dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate()));
    const [selectedServerEndTime, setSelectedServerEndTime] = useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
    const [selectedServerIsConfirmed, setSelectedServerIsConfirmed] = useState(filtersDefValue.isConfirmed);
    const [selectedServerIsReviewed, setSelectedServerIsReviewed] = useState(filtersDefValue.isReviewed);
    const [selectedServerIsOpened, setSelectedServerIsOpened] = useState(filtersDefValue.isOpened);
    const [selectedServerIsSucceed, setSelectedServerIsSucceed] = useState(filtersDefValue.isSucceed);
    const [reasonsToNotEnter, setReasonsToNotEnter] = React.useState([]);
    const [selectedServerReasonsToNotEnter, setSelectedServerReasonsToNotEnter] = React.useState(filtersDefValue.reasonsToNotEnter ?? []);
    const [symbols, setSymbols] = useState([]);
    const [exchangeSymbols, setExchangeSymbols] = useState([]);

    const booleanSelection = [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    const confirmSelection = [
        { label: 'Has at least one Confirmation', value: 'true' },
        { label: 'Has at least one Rejection', value: 'false' }
    ];
    const [defaultSymbols, setDefaultSymbols] = React.useState();
    const [intervals, setIntervals] = useState(IntervalHelper.intervalsList());

    const [allFiltersData, setAllFiltersData] = useState([])
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
        visibilityDetector.attach('positions-container');
        exchangeServices.getSymbols().then(data => {
            setExchangeSymbols(data);
        });
        scalpServices.getReasonsToNotEnter().then(data => {
            setReasonsToNotEnter(data);
        });
        scalpServices.getSymbols().then(data => {
            setSymbols(data);
            setDefaultSymbols(data);
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
        let reasonsToNotEnter = null;
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
        if (!reasonsToNotEnter && selectedServerReasonsToNotEnter && selectedServerReasonsToNotEnter.length > 0)
            reasonsToNotEnter = selectedServerReasonsToNotEnter.join();

        if (selectedServerStrategies && selectedServerStrategies.length > 0)
            strategies = selectedServerStrategies.join();
        if (selectedServerBacktests && selectedServerBacktests.length > 0)
            backtests = selectedServerBacktests.join();

        scalpServices.getPositions(strategies, backtests, symbols, selectedServerInterval, start, end,
            selectedServerIsRegisteredInMarket, selectedServerIsConfirmed,
            selectedServerIsReviewed, selectedServerIsOpened, selectedServerIsSucceed, reasonsToNotEnter).then(data => {
                setPositions(data);
                setLoading(false);
            });
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
            name: "isRegisteredInMarket",
            label: "Is Registered In Market?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsRegisteredInMarket,
            setState: setSelectedServerIsRegisteredInMarket
        },
        {
            name: "isSucceed",
            label: "Is Succeed (Target Hitted)?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsSucceed,
            setState: setSelectedServerIsSucceed
        },
        {
            name: "isConfirmed",
            label: "Confirmation",
            type: FilterType.DropDown,
            options: confirmSelection,
            state: selectedServerIsConfirmed,
            setState: setSelectedServerIsConfirmed
        },
        {
            name: "isReviewed",
            label: "Is Reviewed?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsReviewed,
            setState: setSelectedServerIsReviewed
        },
        {
            name: "isOpened",
            label: "Is Opened?",
            type: FilterType.DropDown,
            options: booleanSelection,
            state: selectedServerIsOpened,
            setState: setSelectedServerIsOpened
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

    ]

    return (
        <div id="positions-container">
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
                            <MultiSelect id='serverSymbol' value={selectedServerSymbols} options={symbols} filter showClear style={{ width: '90%' }}
                                onChange={(e) => setSelectedServerSymbols(e.value)} placeholder="Select Symbols" className="align-self-end" />
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
                        <label htmlFor="serverIsSucceed" className="align-self-baseline">Is Succeed (Target Hitted)?</label>
                        <Dropdown id='serverIsSucceed' value={selectedServerIsSucceed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsSucceed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsConfirmed" className="align-self-baseline">Confirmation</label>
                        <Dropdown id='serverIsConfirmed' value={selectedServerIsConfirmed} options={confirmSelection} filter showClear
                            onChange={(e) => setSelectedServerIsConfirmed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsReviewed" className="align-self-baseline">Is Reviewed?</label>
                        <Dropdown id='serverIsReviewed' value={selectedServerIsReviewed} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsReviewed(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverIsOpened" className="align-self-baseline">Is Opened?</label>
                        <Dropdown id='serverIsOpened' value={selectedServerIsOpened} options={booleanSelection} filter showClear
                            onChange={(e) => setSelectedServerIsOpened(e.value)} placeholder="Choose filter" className="w-full align-self-end" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
                        <label htmlFor="serverReasonToNotEnters" className="align-self-baseline">Reason To Not Enter</label>
                        <MultiSelect id='serverReasonToNotEnters' value={selectedServerReasonsToNotEnter} options={reasonsToNotEnter} filter showClear
                            onChange={(e) => setSelectedServerReasonsToNotEnter(e.value)} placeholder="Select Reasons" className="w-full align-self-end" />
                    </div>
                    <div className="p-field col-12 md:col-12 flex">
                        <Button type="button" label="Search" className="p-button-raised ml-auto" loading={loading}
                            icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
                        <FilterManager filters={serverCustomableFilters} stateName="server-filters-positions"
                            onSave={loadData} />
                    </div>
                </div>
            </Card>
            <PositionTable loading={loading} positions={positions} setPositions={setPositions}
                tableStateName="dt-state-positions" dataTableName="dt-state-positions" />
        </div>);
}

export default Positions;