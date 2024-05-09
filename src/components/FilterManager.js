import React from "react";
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { classNames } from 'primereact/utils';
import { InputNumber } from 'primereact/inputnumber';
import { dateHelper } from '../utils/DateHelper';
import { dataTableSettingServices } from '../services/DataTableSettingServices';
import { FilterType } from "../utils/FilterType";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from 'primereact/inputswitch';
import { SelectButton } from "primereact/selectbutton";

import '../assets/scss/FilterManager.scss';

const FilterManager = ({ filters, stateName, buttonClassNames }, ref) => {
    const [showDialog, setShowDialog] = React.useState(false);
    const [dateNumber, setDateNumber] = React.useState({});
    const [dateType, setDateType] = React.useState({});
    const [filtersState, setFiltersState] = React.useState({});

    React.useEffect(() => {
        filters.forEach(filter => {
            if (filter.type === FilterType.Couter) {
                // const state = window.localStorage.getItem(stateName);
                // var filtersDefValue = state ? JSON.parse(state) : {};
                // filtersState[filter.name] = filtersDefValue[filter.name] ?? 1;
            }
            else if (filter.type === FilterType.Date) {
                var today = moment();
                var diffDays = today.diff(filter.state, 'days');
                var diffMonths = today.diff(filter.state, 'months');
                var diffYears = today.diff(filter.state, 'years');
                dateNumber[filter.name] = diffYears === 0 ? (diffMonths === 0 ? diffDays : diffMonths) : diffYears;
                setDateNumber(dateNumber);
                dateType[filter.name] = diffYears === 0 ? (diffMonths === 0 ? 'days' : 'months') : 'years';
                setDateType(dateType);
            }
            else {
                filtersState[filter.name] = filter.state;
            }
        });
        setFiltersState(filtersState);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onSaveClicked = () => {
        filters.filter(x => x.type !== FilterType.Couter).forEach((f) => {
            f.state = filtersState[f.name];
            f.setState(filtersState[f.name]);
        });
        //var counterFilters = filters.filter(x => x.type === FilterType.Couter);
        // counterFilters.forEach((filter) => {
        //     filter.state = filtersState[filter.name];
        //     if (filter.options && filter.options.length >= (filter.state ?? 1)) {
        //         filter.setState([filter.options[(filter.state ?? 1) - 1].value]);
        //     }
        // })
        var startDate = filters.find(x => x.name === "startDate");
        if (startDate) {
            var dateNumber = document.getElementById(`startDateNumber`);
            if (dateNumber.value) {
                var parent = dateNumber.parentElement;
                var dateType = parent.getElementsByTagName("select")[0].value;
                startDate.state = { value: dateNumber.value, type: dateType };
                var date = dateHelper.considerAsLocal(moment().subtract(parseInt(dateNumber.value), dateType).toDate());
                startDate.setState(date);
            }
        }
        var endDate = filters.find(x => x.name === "endDate");
        if (endDate) {
            dateNumber = document.getElementById(`endDateNumber`);
            if (dateNumber.value) {
                parent = dateNumber.parentElement;
                dateType = parent.getElementsByTagName("select")[0].value;
                endDate.state = { value: dateNumber.value, type: dateType };
                date = dateHelper.considerAsLocal(moment().subtract(parseInt(dateNumber.value), dateType).toDate());
                endDate.setState(date);
            }
        }

        var stateValue = {};
        filters.forEach((item) => {
            stateValue[item.name] = item.state;
        });

        dataTableSettingServices.set(stateName, stateValue);
        onHideDialog();
    }

    const onHideDialog = () => {
        setShowDialog(false);
    }

    const renderFooter = () => {
        return (
            <div className="flex flex-wrap w-100">
                <Button label="Save" className="p-button-raised p-button-success m-2 ml-auto" onClick={onSaveClicked} />
            </div>
        );
    }

    const onFilterChange = (ev) => {
        filtersState[ev.target.id] = ev.target.value;
        setFiltersState(filtersState);
    }

    const onDateTypeChange = (ev) => {
        var type = ev.target.value;
        dateType[ev.target.name] = type;
        setDateType(dateType);
    }
    const onDateValueChange = (ev) => {
        var number = ev.target.value;
        dateNumber[ev.target.name] = number;
        setDateNumber(dateNumber);
    }

    if (ref)
        ref.current = {};

    return (
        <React.Fragment>
            <Dialog id="filter-manager" header="Filter Manager" footer={renderFooter}
                visible={showDialog} maximizable modal style={{ width: '70vw' }} onHide={onHideDialog}>
                <div className="grid p-fluid" id="serverSearchBox" >
                    {
                        filters.map(x => {
                            switch (x.type) {
                                case FilterType.DropDown:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <Dropdown id={x.name} value={filtersState[x.name]} options={x.options} filter showClear placeholder="Choose filter"
                                                onChange={onFilterChange} className="w-full align-self-end" />
                                        </div>
                                    )
                                case FilterType.MultiSelect:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <MultiSelect id={x.name} value={filtersState[x.name]} options={x.options} filter showClear placeholder={`Select ${x.label}`}
                                                onChange={onFilterChange} className="w-full align-self-end" />
                                        </div>
                                    )
                                case FilterType.Couter:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">Number Of Latest {x.label}</label>
                                            <InputNumber className="m-0" id={x.name} inputId={x.name} value={filtersState[x.name]}
                                                onValueChange={onFilterChange} showButtons min={0} />
                                        </div>
                                    )
                                case FilterType.Date:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-6 flex flex-wrap">
                                            <label htmlFor={x.name} className="w-full align-self-baseline">{x.label}</label>
                                            <div className="w-full flex flex-wrap align-items-center">
                                                <input type="number" id={`${x.name}Number`} name={x.name} min={0} value={dateNumber[x.name]}
                                                    onChange={onDateValueChange} className="customInput" style={{ width: "50%" }} />
                                                <select onChange={onDateTypeChange} name={x.name} value={dateType[x.name]}
                                                    className="customInput m-1" style={{ width: "35%" }}>
                                                    <option value="days">Days</option>
                                                    <option value="months">Months</option>
                                                    <option value="years">Years</option>
                                                </select>
                                                <span className="m-1">ago</span>
                                            </div>
                                        </div>
                                    )
                                case FilterType.Time:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <InputMask id={x.name} mask="99:99:99" value={filtersState[x.name]} onChange={onFilterChange}
                                                className="w-full align-self-end" />
                                        </div>
                                    )
                                case FilterType.Decimal:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <InputNumber id={x.name} value={filtersState[x.name]} onValueChange={onFilterChange}
                                                mode="decimal" minFractionDigits={1} maxFractionDigits={16} showButtons className="w-full align-self-end" />
                                        </div>
                                    )
                                case FilterType.Number:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <InputNumber className="m-0" id={x.name} inputId={x.name} value={filtersState[x.name]}
                                                onValueChange={onFilterChange} showButtons min={0} />
                                        </div>
                                    )
                                case FilterType.Text:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <InputText id={x.name} value={filtersState[x.name]} onChange={onFilterChange} autoFocus />
                                        </div>
                                    )
                                case FilterType.SelectButton:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap">
                                            <label htmlFor={x.name} className="align-self-baseline">{x.label}</label>
                                            <SelectButton value={filtersState[x.name]} id={x.name} options={x.options} optionLabel="name"
                                                onChange={onFilterChange} style={{ flexBasis: '100%' }} className="w-full align-self-end" />
                                        </div>
                                    )
                                case FilterType.Switch:
                                    return (
                                        <div key={x.name} className="col-12 md:col-6 lg:col-4 flex flex-wrap align-content-center">
                                            <InputSwitch id={x.name} checked={filtersState[x.name]} onChange={onFilterChange} />
                                            <label htmlFor={x.name} className="align-self-center ml-2">{x.label}</label>
                                        </div>
                                    )
                                default:
                                    return '';
                            }
                        })
                    }
                </div>
            </Dialog>
            <Button type="button" icon="pi pi-cog" className={classNames("p-button-help ml-1", buttonClassNames)}
                onClick={() => setShowDialog(true)} />
        </React.Fragment>
    );
};


FilterManager.prototype = {
    filters: PropTypes.array,
    stateName: PropTypes.string,
    buttonClassNames: PropTypes.string,
    ref: PropTypes.object,
}

export default React.forwardRef(FilterManager);