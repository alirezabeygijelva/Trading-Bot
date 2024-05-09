
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip as ReactTooltip, TooltipWrapper } from "react-tooltip";
import classNames from 'classnames';
import 'react-tooltip/dist/react-tooltip.css';
import '../assets/scss/BotControl.scss';

const ProButton = ({ id, className, icon, iconClassName, loading, tooltip, onClick, type, disabled }) => {
  const randomNum = Math.round(1 + Math.random() * (1000 - 1));

  React.useEffect(() => {

  }, []);// eslint-disable-line react-hooks/exhaustive-deps
  const clicked = () => {
    if (onClick && !loading && !disabled)
      onClick();
  }
  const buttonClasses = classNames('p-button', className, {
    'p-button-loading': loading
  });
  const iconClasses = classNames(iconClassName, {
    'fa-spin': loading
  });
  return <React.Fragment>
    <TooltipWrapper tooltipId={`tooltip-${id ?? randomNum}`}>
      <button id={id} className={buttonClasses} onClick={clicked} type={type}>
        <FontAwesomeIcon className={iconClasses} icon={loading ? 'fa-solid fa-circle-notch' : icon} />
      </button>
    </TooltipWrapper>
    {tooltip &&
      <ReactTooltip id={`tooltip-${id ?? randomNum}`} place="bottom" type="dark" effect="solid">
        {tooltip}
      </ReactTooltip >
    }
  </React.Fragment >
};

export default ProButton;