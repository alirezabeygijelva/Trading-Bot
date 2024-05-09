import { classNames } from 'primereact/utils';
import { Tooltip as ReactTooltip, TooltipWrapper } from "react-tooltip";
import { contentHelper } from '../utils/ContentHelper';
import PropTypes from 'prop-types';
import 'react-tooltip/dist/react-tooltip.css';
const LabelWithValue = ({ displayText, value, isValueObject, className, labelClassName, valueClassName,
    prefix, sufix, precision, valueColor, labelTooltip, tooltipKey, errorMessage, errorIcon }) => {
    return (
        <div className={classNames("align-items-center", className)}>
            <TooltipWrapper tooltipId={tooltipKey}>
                <label className={classNames("block", labelClassName ?? "font-bold")}>
                    {displayText}
                </label>
            </TooltipWrapper>
            {
                labelTooltip && <ReactTooltip id={tooltipKey}
                    place="right" type="dark" effect="solid">
                    <div className="flex flex-wrap" style={{ maxWidth: '300px' }}>
                        <div className="w-full white-space-normal"  dangerouslySetInnerHTML={contentHelper.createMarkup(labelTooltip)}></div>
                    </div>
                </ReactTooltip >
            }
            <span className={classNames("ml-2", valueClassName)} style={{ 'color': valueColor }}>
                {
                    isValueObject
                        ? value
                        : !value || isNaN(value)
                            ? `${prefix ?? ''}${value ?? ''}${sufix ?? ''}`
                            : `${prefix ?? ''}${value?.toLocaleString(undefined, { maximumFractionDigits: precision ?? 4 }) ?? ''}${sufix ?? ''}`}
            </span>
            {errorMessage && <i title={errorMessage} className={`${errorIcon} ml-2`} style={{ cursor: 'pointer' }}></i>}
        </div >
    );
}
LabelWithValue.defaultProps = {
    valueColor: '#000000'
}
LabelWithValue.prototype = {
    displayText: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    valueClassName: PropTypes.string,
    prefix: PropTypes.string,
    sufix: PropTypes.string,
    precision: PropTypes.number,
    valueColor: PropTypes.string,
    errorMessage: PropTypes.string,
    errorIcon: PropTypes.string
}
export default LabelWithValue;