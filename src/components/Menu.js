import React from 'react';
import classNames from 'classnames';
import { TooltipWrapper } from "react-tooltip";
import { NavLink, useLocation } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-tooltip/dist/react-tooltip.css';

const Submenu = (props) => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = React.useState(null)

    React.useEffect(() => {
        let index = props?.items?.findIndex(e => {
            if (location.pathname.toLowerCase().startsWith(e.target)) {
                return true;
            }
            return false;
        });
        setActiveIndex(index);
    }, [location, props.items]);

    const onMenuItemClick = (event, item, index, openInNewTab) => {
        //avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        //execute command
        if (item.command) {
            item.command({ openInNewTab: openInNewTab, originalEvent: event, item: item });
        }
        if (openInNewTab)
            return;

        if (index === activeIndex)
            setActiveIndex(null);
        else
            setActiveIndex(index);

        if (props.onMenuItemClick) {
            props.onMenuItemClick({
                originalEvent: event,
                item: item
            });
        }
    }

    const renderLinkContent = (item) => {
        let submenuIcon = item.items && <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>;
        let badge = item.badge && <span className="menuitem-badge">{item.badge}</span>;

        return (
            <React.Fragment>
                <FontAwesomeIcon icon={item.icon} />
                {!props.isIconSidebar && <span>{item.label}</span>}
                {!props.isIconSidebar && submenuIcon}
                {!props.isIconSidebar && badge}
            </React.Fragment>
        );
    }

    const renderLink = (item, i) => {
        let content = renderLinkContent(item);

        if (item.to) {
            return (
                <NavLink activeClassName="active-route"
                    to={item.to} target={item.target} exact
                    onClick={(e) => onMenuItemClick(e, item, i)} onAuxClick={(e) => onMenuItemClick(e, item, i, true)}>
                    {content}
                </NavLink>
            )
        }
        else {
            return (
                <a href={item.url} onClick={(e) => onMenuItemClick(e, item, i)}
                    onAuxClick={(e) => onMenuItemClick(e, item, i, true)} target={item.target}>
                    {content}
                </a>
            );
        }
    }

    const items = props.items && props.items.map((item, i) => {
        const active = activeIndex === i;
        const styleClass = classNames(item.classNames, { 'active-menuitem': active && !item.to });

        return (
            <li className={styleClass} key={i}>
                <TooltipWrapper content={item.title}>
                    {item.items && props.root === true && <div className='arrow'></div>}
                    {renderLink(item, i)}
                    <CSSTransition classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit>
                        <Submenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </CSSTransition>
                </TooltipWrapper>
            </li>
        );
    });

    return items ? <ul className={props.className}>{items}</ul> : null;
}

export const Menu = (props) => {
    return (
        <div className="layout-menu-container">
            <Submenu items={props.model} className="layout-menu" onMenuItemClick={props.onMenuItemClick} root={true} isIconSidebar={props.isIconSidebar} />
        </div>
    );
}
