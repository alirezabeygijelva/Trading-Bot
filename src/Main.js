import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { ProgressSpinner } from 'primereact/progressspinner';
import FinanceManagement from './pages/FinanceManagement';
import Positions from './pages/Positions';
import Reports from './pages/Reports';
import { Profile } from "./components/Profile";
import { Menu } from "./components/Menu";
import PrivateRoute from './components/PrivateRoute';
import { Role } from './utils/Role';
import { CSSTransition } from 'react-transition-group';
import { accountServices } from './services/AccountServices';
import { scalpServices } from './services/ScalpServices';
import { dataTableSettingServices } from './services/DataTableSettingServices';
import { Note } from './components/Note';
import Time from './components/Time';
import { Toast } from 'primereact/toast';
import { EngineHubContext } from './contexts/EngineHubContext';
import useTranslation from './lib/localization';
import StockChart from './pages/StockChart';
import './assets/scss/Main.scss';


function Main({ pathName }) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { botMessage } = React.useContext(EngineHubContext);
  // const { pathname } = useLocation();
  const toast = useRef(null);
  const sidebar = useRef();
  const cm = useRef(null);
  //const { actionItems, addItems } = useContext(QuickActionsContext);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(null);
  const [menuInactive, setMenuInactive] = useState(JSON.parse(window.localStorage.getItem("menuInactive")));
  const [mobileMenuActive, setMobileMenuActive] = useState(JSON.parse(window.localStorage.getItem("mobileMenuActive")));
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [displayChangelogDialog, setDisplayChangelogDialog] = useState(false);
  const [websiteVersions, setWebsiteVersions] = useState(null);
  const [displayState, setDisplayState] = useState(null);
  const [avatar, setAvatar] = useState(null);

  let menuClick = false;

  useEffect(() => {
    if (botMessage && botMessage.message) {
      //Success:0
      //Fail:1
      //Info:2
      //Warning:3
      if (botMessage.messageType === 'Success') {
        toast.current.show({ severity: 'success', detail: botMessage.message, life: 5000 })
      } else if (botMessage.messageType === 'Fail') {
        toast.current.show({ severity: 'error', detail: botMessage.message, sticky: true, })
      } else if (botMessage.messageType === 'Info') {
        toast.current.show({ severity: 'info', detail: botMessage.message, life: 5000 })
      } else if (botMessage.messageType === 'Warning') {
        toast.current.show({ severity: 'warn', detail: botMessage.message, life: 8000 })
      }
    }
  }, [botMessage]);

  useEffect(() => {
    if (currentUser && !currentUser.email) {
      accountServices.logout();
    }
  }, [currentUser]);

  useEffect(() => {
    accountServices.currentUser.subscribe((user) => {
      setCurrentUser(user);
      setRoles(user && accountServices.currentUserRoles);
    });

    if (process.env.REACT_APP_ENV === 'karabot') {
      setVersion(process.env.REACT_APP_VERSION);
    } else {
      scalpServices.getWebsiteVersions().then(data => {
        setWebsiteVersions(data);
        if (data && Array.isArray(data)) {
          var latestVersion = data[0];
          if (latestVersion) {
            setVersion(latestVersion.name);
          }
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    dataTableSettingServices.get().then(data => {
      data.forEach(x => {
        window.localStorage.setItem(x.tableKey, x.options)
      });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setMenuItems(items(roles));
  }, [roles]);

  useEffect(() => {
    if (mobileMenuActive) {
      addClass(document.body, 'body-overflow-hidden');
    }
    else {
      removeClass(document.body, 'body-overflow-hidden');
    }
  }, [mobileMenuActive]);

  const onSidebarClick = () => {
    menuClick = true;
  }

  const wrapperClass = classNames('Main', 'layout-wrapper', 'layout-static', {
    'layout-static-sidebar-inactive': menuInactive,
    'layout-mobile-sidebar-active': mobileMenuActive
  });

  const addClass = (element, className) => {
    if (element.classList)
      element.classList.add(className);
    else
      element.className += ' ' + className;
  }

  const removeClass = (element, className) => {
    if (element.classList)
      element.classList.remove(className);
    else
      element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

  const isDesktop = () => {
    return window.innerWidth > 1024;
  }

  const onMenuItemClick = (event) => {
    if (!event.item.items) {
      setMobileMenuActive(false);
    }
  }

  const onWrapperClick = (event) => {
    if (!menuClick) {
      setMobileMenuActive(false);
    }
    menuClick = false;
  }

  const onToggleMenu = (event) => {
    menuClick = true;

    if (isDesktop()) {
      setMenuInactive(prevState => !prevState);
      window.localStorage.setItem("menuInactive", !menuInactive);
    }
    else {
      setMobileMenuActive(prevState => !prevState);
      window.localStorage.setItem("mobileMenuActive", !mobileMenuActive);
    }
    event.preventDefault();
  }

  const isSidebarVisible = () => {
    if (isDesktop()) {
      return !menuInactive;
    }
    return mobileMenuActive;
  }

  const isIconSidebarVisible = () => {
    if (isDesktop()) {
      return menuInactive;
    }
    return false;
  }

  const items = (roles) => {
    let items = [
    ];
    if (roles) {
      items.push(
        {
          label: t("menuItem.financeManagement"),
          title: t("menuItem.financeManagement"),
          icon: "dollar-sign",
          target: '/financemanagement',
          command: (options) => {
            if (options?.openInNewTab) {
              window.open("/financemanagement", "_blank");
            }
            else
              navigate('/financemanagement');
          }
        })

      if (roles.includes(Role.Admin) || roles.includes(Role.ScalpDev) || roles.includes(Role.Analyze)) {
        items.push(
          {
            label: t("menuItem.strategy"),
            title: t("menuItem.strategy"),
            icon: "fa-diagram-project",
            target: '/strategies',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/strategies", "_blank");
              else
                navigate('/strategies');
            }
          },
          {
            label: t("menuItem.strategyBacktest"),
            title: t("menuItem.strategyBacktest"),
            icon: 'fa-magnifying-glass-chart',
            target: '/strategybacktests',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/strategybacktests", "_blank");
              else
                navigate('/strategybacktests');
            }
          },
          {
            label: t("menuItem.settings"),
            title: t("menuItem.settings"),
            icon: 'gear',
            target: '/settings',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/settings", "_blank");
              else
                navigate('/settings');
            }
          }
        );
      };

      if (roles.includes(Role.Admin) || roles.includes(Role.ScalpDev) ||
        roles.includes(Role.Analyze) || roles.includes(Role.Standard)) {
        items.push(
          {
            label: t("menuItem.prerequisites"),
            title: t("menuItem.prerequisites"),
            icon: "clipboard-check",
            target: '/prerequisites',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/prerequisites", "_blank");
              else
                navigate('/prerequisites');
            }
          },
          {
            label: t("menuItem.positions"),
            title: t("menuItem.positions"),
            icon: "grip-lines",
            target: '/positions',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/positions", "_blank");
              else
                navigate('/positions');
            }
          },
          {
            label: t("menuItem.chart"),
            title: t("menuItem.chart"),
            icon: "chart-bar",
            target: '/chart',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/chart", "_blank");
              else
                navigate('/chart');
            }
          },
          {
            label: t("menuItem.reports"),
            title: t("menuItem.reports"),
            icon: "clipboard-list",
            target: '/reports',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/reports", "_blank");
              else
                navigate('/reports');
            }
          },
          {
            label: t("menuItem.wiki"),
            title: t("menuItem.wiki"),
            icon: "book-atlas",
            target: '/wiki',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/wikis", "_blank");
              else
                navigate('/wikis');
            }
          },
          //DELETED FOR CLIENT VERSION
          // {
          //   label: t("menuItem.missedPrerequisite-Position"),
          //   title: t("menuItem.missedPrerequisite-Position"),
          //   icon: "exclamation-circle",
          //   target: '/missedprepos',
          //   command: (options) => {
          //     if (options?.openInNewTab)
          //       window.open("/missedprepos", "_blank");
          //     else
          //       navigate('/missedprepos');
          //   }
          // }
        )
      };
      if (roles.includes(Role.Admin) || roles.includes(Role.ScalpDev)) {
        items.push(
          //DELETED FOR CLIENT VERSION
          // {
          //   label: t("menuItem.notes"),
          //   title: t("menuItem.notes"),
          //   icon: "comment-dots",
          //   target: '/notes',
          //   command: (options) => {
          //     if (options?.openInNewTab)
          //       window.open("/notes", "_blank");
          //     else
          //       navigate('/notes');
          //   }
          // },
          {
            label: t("menuItem.adminTools"),
            title: t("menuItem.adminTools"),
            icon: "user-cog",
            target: '/admintools',
            command: (options) => {
              if (options?.openInNewTab)
                window.open("/admintools", "_blank");
              else
                navigate('/admintools');
            }
          }
        )
      }

      //DELETED FOR CLIENT VERSION
      // if (roles.includes(Role.Admin) || roles.includes(Role.ScalpDev) || roles.includes(Role.Analyze)) {
      //   items.push(
      // {
      //   label: t("menuItem.divergenceEngine"),
      //   title: t("menuItem.divergenceEngine"),
      //   icon: "brain",
      //   classNames: 'white-separator',
      //   target: '/divergenceengine',
      //   command: (options) => {
      //     if (options?.openInNewTab)
      //       window.open("/divergenceengine", "_blank");
      //     else
      //       navigate('/divergenceengine');
      //   }
      // },
      //     {
      //       label: t("menuItem.divergencesimulations"),
      //       title: t("menuItem.divergencesimulations"),
      //       icon: "random",
      //       target: '/divergencesimulation',
      //       command: (options) => {
      //         if (options?.openInNewTab)
      //           window.open("/divergencesimulation", "_blank");
      //         else
      //           navigate('/divergencesimulation');
      //       }
      //     }
      //   )
      // }

    }
    return items;
  }

  const onChangelogHide = () => {
    setDisplayChangelogDialog(false);
  }

  const onChangelogOpen = () => {
    if (process.env.REACT_APP_ENV === 'karabot') {
      return;
    }
    setDisplayChangelogDialog(true);
  }

  const onContextMenu = (e) => {
    if (process.env.REACT_APP_ENV === 'karabot') {
      return;
    }
    cm.current.show(e)
  }
  return (
    <div id="main-container" className={wrapperClass} onClick={onWrapperClick}>
      <Toast ref={toast} />
      <CSSTransition classNames="layout-sidebar" timeout={{ enter: 200, exit: 200 }} in={isSidebarVisible()} unmountOnExit>
        <div ref={sidebar} className="layout-sidebar layout-sidebar-dark" style={{ overflowY: 'hidden' }} onClick={onSidebarClick}>
          <div className="flex justify-content-between">
            <div className="layout-logo" style={{ cursor: 'pointer', flex: 'auto' }} onClick={() => navigate('/')}>
              <span className="w-full text-white font-semibold text-3xl underline" onContextMenu={onContextMenu}>{t("karaBot")}</span>
            </div>
            <i className="slide-out pi pi-angle-left" onClick={onToggleMenu}></i>
          </div>
          {
            (roles && !roles.includes(Role.Plan1)) &&
            <React.Fragment>
              <Time />
            </React.Fragment>
          }
          <Profile user={currentUser} avatar={avatar} setAvatar={setAvatar} />
          <Menu model={menuItems} onMenuItemClick={onMenuItemClick} />
          {version && <div className="version absolute w-full text-center p-2" onClick={onChangelogOpen}>
            {t("main.version")} {version}
          </div>}
        </div>
      </CSSTransition >
      <CSSTransition classNames="layout-sidebar" timeout={{ enter: 200, exit: 200 }} in={isIconSidebarVisible()} unmountOnExit>
        <div ref={sidebar} className="layout-sidebar layout-sidebar-dark" style={{ width: "50px", overflowY: 'hidden' }}>
          <div className="flex justify-content-between" style={{ zIndex: 1 }} >
            <div className="layout-logo"></div>
            <i className="slide-out pi pi-angle-right" onClick={onToggleMenu}></i>
          </div>
          <Profile user={currentUser} isIconSidebar={true} avatar={avatar} setAvatar={setAvatar} />
          <Menu model={menuItems} onMenuItemClick={onMenuItemClick} isIconSidebar={true} />
        </div>
      </CSSTransition>
      <i className="slide-in pi pi-angle-right" style={{ zIndex: 1000 }} onClick={onToggleMenu}></i>
      <div className="layout-main" id="main-layout">
        {/* {pathname !== '/botmanagement' && process.env.REACT_APP_ENV !== 'karabot' && <BotControl simplifiedView={false} />} */}
        {
          loading ? <div className="w-full text-center"><ProgressSpinner /></div>
            : <React.Fragment>
              {/* <Router history={history}> */}
              <Routes>
                {/* //DELETED FOR CLIENT VERSION */}
                {/* <Route path="/dashboard" element={<PrivateRoute />} >
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route> */}
                <Route path="/financemanagement" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard, Role.Guest]} />} >
                  <Route path="/financemanagement" element={< FinanceManagement />} />
                </Route>
                <Route path="/positions" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/positions" element={<Positions />} />
                </Route>
                <Route path="/chart" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/chart" element={<StockChart />} />
                </Route>
                <Route path="/chart/:id" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/chart/:id" element={<StockChart />} />
                </Route>
                <Route path="/reports" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/reports" element={<Reports />} />
                </Route>
                <Route path="/reports/statistical/:id" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/reports/statistical/:id" element={<Reports />} />
                </Route>
                <Route path="/reports/analytical/:id" element={<PrivateRoute roles={[Role.Admin, Role.Analyze, Role.ScalpDev, Role.Standard]} />} >
                  <Route path="/reports/analytical/:id" element={<Reports />} />
                </Route>
                <Route path="*" element={<PrivateRoute />} >
                  {/* DELETED FOR CLIENT VERSION */}
                  <Route path="*" element={<FinanceManagement />} />
                </Route>
              </Routes>
              {/* {(roles && !roles.includes(Role.Plan1)) && <SpeedDial model={actionItems} direction="up" className="tools-speeddial" />} */}
              <Note displayState={displayState} displayFunc={setDisplayState} />
            </React.Fragment>
        }
      </div>
      <div className="layout-footer">
        <span>{t("copyrightPartTwo")}<a href="https://www.karabot.ir" target="_blank" rel="noreferrer">{t("companyName")}</a>{t("copyrightPartOne")}</span>
      </div>
      <Dialog header={t("main.changelogs")} className="changelog" dismissableMask={true} maximizable
        visible={displayChangelogDialog} onHide={() => onChangelogHide()} breakpoints={{ '960px': '75vw', '640px': '100vw' }} style={{ width: '50vw' }}>
      </Dialog >
      <ReactTooltip place="right" type="dark" effect="solid" offset={20} />
    </div >
  );
}

export default Main;