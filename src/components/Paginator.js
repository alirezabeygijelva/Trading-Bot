import React from "react";
import PropTypes from 'prop-types';
//import { InputText } from 'primereact/inputtext';
import { Ripple } from 'primereact/ripple';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

const Paginator = ({ setFirst, setRows }, ref) => {
    //const [pageInputTooltip, setPageInputTooltip] = React.useState('Press \'Enter\' key to go to this page.');
    //const [currentPage, setCurrentPage] = React.useState(1);

    // function onPageInputChange(event) {
    //     setCurrentPage(event.target.value);
    // }

    // function onPageInputKeyDown(event, options) {
    //     if (event.key === 'Enter') {
    //         const page = parseInt(currentPage);
    //         if (page < 0 || page > options.totalPages) {
    //             setPageInputTooltip(`Value must be between 1 and ${options.totalPages}.`);
    //         }
    //         else {
    //             const first = currentPage ? options.rows * (page - 1) : 0;
    //             if (setFirst)
    //                 setFirst(first);
    //             setPageInputTooltip('Press \'Enter\' key to go to this page.');
    //         }
    //     }
    // }
    const onPage = (event) => {
        if (setFirst)
            setFirst(event.first);
        if (setRows)
            setRows(event.rows);
        //setCurrentPage(event.page + 1);
    }

    const paginatorTemplate = {
        layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport',
        'PrevPageLink': (options) => {
            return (
                <button type="button" className={options.className} onClick={options.onClick} disabled={options.disabled}>
                    <span className="p-3">Previous</span>
                    <Ripple />
                </button>
            )
        },
        'NextPageLink': (options) => {
            return (
                <button type="button" className={options.className} onClick={options.onClick} disabled={options.disabled}>
                    <span className="p-3">Next</span>
                    <Ripple />
                </button>
            )
        },
        'PageLinks': (options) => {
            if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
                const className = classNames(options.className, { 'p-disabled': true });

                return <span className={className} style={{ userSelect: 'none' }}>...</span>;
            }

            return (
                <button type="button" className={options.className} onClick={options.onClick}>
                    {options.page + 1}
                    <Ripple />
                </button>
            )
        },
        'RowsPerPageDropdown': (options) => {
            const dropdownOptions = [
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 50, value: 50 },
                { label: 'All', value: options.totalRecords }
            ];

            return <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} appendTo={document.body} />;
        },
        'CurrentPageReport': (options) => {
            return (
                <React.Fragment>
                    {/* <span className="mx-3" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
                        Go to <InputText size="2" className="ml-1" value={currentPage} tooltip={pageInputTooltip}
                            onKeyDown={(e) => onPageInputKeyDown(e, options)} onChange={onPageInputChange} />
                    </span> */}
                    <span style={{ color: 'var(--text-color)', userSelect: 'none', width: '120px', textAlign: 'center' }}>
                        {options.first} - {options.last} of {options.totalRecords}
                    </span>
                </React.Fragment>
            )
        }
    };
    if (ref)
        ref.current = {
            onPage: onPage,
            paginatorTemplate: paginatorTemplate
        };
    return ('');
};


Paginator.prototype = {
    setFirst: PropTypes.func,
    setRows: PropTypes.func,
    ref: PropTypes.object
}

export default React.forwardRef(Paginator);