import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import Indicators from "highcharts/indicators/indicators-all.js";
import DragPanes from "highcharts/modules/drag-panes.js";
import AnnotationsAdvanced from "highcharts/modules/annotations-advanced.js";
import PriceIndicator from "highcharts/modules/price-indicator.js";
import FullScreen from "highcharts/modules/full-screen.js";
import StockTools from "highcharts/modules/stock-tools.js";
import Exporting from "highcharts/modules/exporting.js";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { ContextMenu } from 'primereact/contextmenu';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { contentHelper } from '../utils/ContentHelper';
import { templates } from '../utils/Templates';
import { dateHelper } from '../utils/DateHelper';
import { Role } from '../utils/Role';
import { reflowChart } from '../utils/ReflowChart';
import { accountServices } from '../services/AccountServices';
import { exchangeServices } from '../services/ExchangeServices';
import { scalpServices } from '../services/ScalpServices';
import { simulationServices } from '../services/SimulationServices';
import { divergenceServices } from '../services/DivergenceServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { columnHelper } from '../utils/ColumnHelper';
import { FilterType } from '../utils/FilterType';
import Export from '../components/Export';
import ColumnManager from '../components/ColumnManager';
import FilterManager from '../components/FilterManager';
import '../assets/scss/StockChart.scss';
import { IntervalHelper } from '../utils/IntervalHelper';
import PositionTable from '../components/PositionTable';

Indicators(Highcharts);
DragPanes(Highcharts);
AnnotationsAdvanced(Highcharts);
PriceIndicator(Highcharts);
FullScreen(Highcharts);
StockTools(Highcharts);
Exporting(Highcharts);

const StockChart = () => {
  const state = window.localStorage.getItem("server-filters-stock-chart");
  var filtersDefValue = state ? JSON.parse(state) : {};
  const cm = useRef(null);
  const chart = useRef(null);
  const toast = useRef(null);
  const isReviewed = useRef(false);
  const isConfirmed = useRef(null);
  const location = useLocation();
  const [showSizeRatio, setShowSizeRatio] = useState(true);
  const [data, setData] = useState([]);
  const [candlesSeries, setCandlesSeries] = useState([]);
  const [chartEnd, setChartEnd] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [iconLoading, setIconLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(null);
  const [visibilityToggle, setVisibilityToggle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [showDivergenceTable, setShowDivergenceTable] = useState(false);
  const [selectedServerSymbol, setSelectedServerSymbol] = useState(filtersDefValue.symbol);
  const [selectedServerInterval, setSelectedServerInterval] = useState(filtersDefValue.timeFrame);
  const [selectedServerStartDate, setSelectedServerStartDate] = useState(
    dateHelper.considerAsLocal(moment().subtract(filtersDefValue.startDate?.value ?? 1, filtersDefValue.startDate?.type ?? 'days').toDate())
  );
  const [selectedServerStartTime, setSelectedServerStartTime] = useState(filtersDefValue.startTime ? filtersDefValue.startTime : "00:00:00");
  const [selectedServerEndDate, setSelectedServerEndDate] = useState(
    dateHelper.considerAsLocal(moment().subtract(filtersDefValue.endDate?.value ?? 0, filtersDefValue.endDate?.type ?? 'days').toDate())
  );
  const [selectedServerEndTime, setSelectedServerEndTime] = useState(filtersDefValue.endTime ? filtersDefValue.endTime : "23:59:59");
  const [selectedServerShow, setSelectedServerShow] = useState(filtersDefValue.show);
  const [selectedServerOptionsIds, setSelectedServerOptionsIds] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [exchangeSymbols, setExchangeSymbols] = useState([]);
  const [userId, setUserId] = useState('');
  const [roles, setRoles] = useState([]);
  const [chartType, setChartType] = useState('');
  const [clickedRowId, setClickedRowId] = useState(-1);
  const [missedDivergenceX, setMissedDivergenceX] = useState(null);
  const [missedDivergenceSymbol, setMissedDivergenceSymbol] = useState(null);
  const [missedDivergenceInterval, setMissedDivergenceInterval] = useState(null);
  const [optionsIds, setOptionsIds] = useState([]);
  const [showReportMissedItems, setShowReportMissedItems] = useState(false);
  const [showServerOptions, setShowServerOptions] = useState(false);
  const [multiSortMeta, setMultiSortMeta] = useState([]);
  const [strategyNames, setStrategyNames] = useState([]);
  const [backtestNames, setBacktestNames] = useState([]);

  const defaultOptions = {
    chart: {
      height: "50%"
    },
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: false
        },
        cursor: 'pointer',
        events: {
          click: function (event) {
            setMissedDivergenceX(event.point.options.x);
          }
        }
      },
      candlestick: {
        color: '#CF304A',
        upColor: '#0ECB81'
      },
      column: {
        pointPadding: 0.1,
        borderWidth: 0,
        groupPadding: 0,
        shadow: false,
        zones: [{
          value: 0,
          color: '#E07A8B'
        }, {
          color: '#50F3B5'
        }]
      },
      spline: {
        color: '#2962FF',
        lineWidth: 1,
        enableMouseTracking: false
      }
    },
    legend: {
      enabled: false
    },
    rangeSelector: {
      enabled: false
    },
    navigator: {
      enabled: true
    },
    stockTools: {
      gui: {
        buttons: ['separator', 'simpleShapes', 'lines', 'crookedLines', 'measure', 'advanced',
          'toggleAnnotations', 'separator', 'verticalLabels', 'flags', 'separator', 'zoomChange',
          'fullScreen', 'typeChange', 'separator', 'currentPriceIndicator', 'saveChart']
      }
    },
    xAxis: {
      crosshair: true
    },
    yAxis: [
      {
        height: '75%',
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: ''
        },
        resize: {
          enabled: true
        },
        crosshair: true
      },
      {
        top: '75%',
        height: '25%',
        labels: {
          align: 'right',
          x: -3
        },
        offset: 0,
        title: {
          text: 'MACD'
        },
        crosshair: true
      }
    ],
    tooltip: {
      shape: 'square',
      headerShape: 'callout',
      borderWidth: 0,
      shadow: false,
      positioner: function (width, height, point) {
        var chart = this.chart,
          position;

        if (point.isHeader) {
          position = {
            x: Math.max(
              // Left side limit
              chart.plotLeft,
              Math.min(
                point.plotX + chart.plotLeft - width / 2,
                // Right side limit
                chart.chartWidth - width - chart.marginRight
              )
            ),
            y: point.plotY
          };
        } else {
          if (point.series)
            position = {
              x: point.series.chart.plotLeft,
              y: point.series.yAxis.top - chart.plotTop
            };
        }

        return position;
      }
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 600
        },
        chartOptions: {
          chart: {
            height: "200%"
          }
        }
      }]
    },
    series: []
  }


  const [stockOptions, setStockOption] = useState(defaultOptions);

  const dockItems = {
    x: missedDivergenceX,
    interval: missedDivergenceInterval,
    symbol: missedDivergenceSymbol
  };

  let tempType = undefined;
  const values = queryString.parse(location.search);
  if (location?.state?.positionsToShow) {
    tempType = "position"
  } else if (location?.state?.oldPrerequisitesToShow) {
    tempType = "oldPrerequisite"
  } else if (location?.state?.prerequisitesToShow) {
    tempType = "prerequisite"
  } else if (location?.state?.livePrerequisitesToShow) {
    tempType = "livePrerequisite"
  } else if (location?.state?.simulatedPrerequisitesToShow) {
    tempType = "simulatedPrerequisite"
  } else if (values?.id) {
    tempType = values.type;
  } else if (selectedServerShow) {
    tempType = selectedServerShow;
  }
  if (!tempType || tempType === undefined || tempType === '')
    tempType = "position";

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
    {
      label: 'Copy URL',
      icon: 'pi pi-fw pi-cpoy',
      command: () => contentHelper.copy(`${window.location.origin}/chart?id=${selectedContent.value.id}&type=${tempType}`)
    }
  ];

  const intervals = IntervalHelper.intervalsList();

  const show = [
    { label: 'Prerequisite', value: 'prerequisite' },
    { label: 'Position', value: 'position' },
    //DELETED FOR CLIENT VERSION 
    // { label: 'Old Prerequisite', value: 'oldPrerequisite' },
    // { label: 'Live Prerequisite', value: 'livePrerequisite' },
    // { label: 'Simulated Prerequisite', value: 'simulatedPrerequisite' },
  ];

  useEffect(() => {
    let items = [...tableData];
    items.forEach(element => {
      element.isHidden = visibilityToggle;
    });
    setTableData(items);
    var visiblePositions = items.filter(x => !x.isHidden);
    loadChartPositions(visiblePositions, candlesSeries, null, chartEnd);
  }, [visibilityToggle]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedServerShow === 'livePrerequisite') {
      setShowServerOptions(true);
      divergenceServices.getOptionsNames().then(data => {
        setOptionsIds(data);
      });
    } else if (selectedServerShow === 'simulatedPrerequisite') {
      setShowServerOptions(true);
      simulationServices.getOptionsNames().then(data => {
        setOptionsIds(data);
      });
    } else {
      setShowServerOptions(false);
    }
  }, [selectedServerShow]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reflowChart.attach(chart);

    accountServices.currentUser.subscribe((user) => {
      setRoles(user && accountServices.currentUserRoles);
      setUserId(user && accountServices.currentUserId);
    });

    scalpServices.getSymbols().then(data => {
      setSymbols(data);
    });
    exchangeServices.getSymbols().then(data => {
      setExchangeSymbols(data);
    });

    scalpServices.getStrategiesDropDown().then((data) => {
      setStrategyNames(data ?? [])
    })
    scalpServices.getBacktestsDropDown().then((data) => {
      setBacktestNames(data ?? [])
    })

    const values = queryString.parse(location.search);
    if (location?.state?.positionsToShow) {
      setChartType('position');
      setShowDivergenceTable(false);
      setShowReportMissedItems(true);
      exchangeServices.getChartDataByPosition(location.state.positionsToShow).then(response => {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
          console.log('DEV: chart response', response);
        if (Array.isArray(response) && response.length > 0) {
          initializeData(response);
          setMissedDivergenceInterval(response[0].interval);
          setMissedDivergenceSymbol(response[0].symbol);
          setLoading(false);
        }
      });
    } else if (location?.state?.oldPrerequisitesToShow) {
      setChartType('oldPrerequisite');
      setShowDivergenceTable(false);
      setShowReportMissedItems(true);
      exchangeServices.getChartDataByPosition(location.state.oldPrerequisitesToShow).then(response => {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
          console.log('DEV: chart response', response);
        if (Array.isArray(response) && response.length > 0) {
          initializeData(response);
          setMissedDivergenceInterval(response[0].interval);
          setMissedDivergenceSymbol(response[0].symbol);
          setLoading(false);
        }
      });
    } else if (location?.state?.prerequisitesToShow) {
      setChartType('prerequisite');
      setShowDivergenceTable(true);
      setShowReportMissedItems(false);
      exchangeServices.getChartDataByDivergence(location.state.prerequisitesToShow).then(response => {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
          console.log('DEV: chart response', response);
        if (Array.isArray(response) && response.length > 0) {
          initializeData(response);
          setLoading(false);
        }
      });
    } else if (location?.state?.livePrerequisitesToShow) {
      setChartType('livePrerequisite');
      setShowDivergenceTable(true);
      setShowReportMissedItems(false);
      exchangeServices.getChartDataByDivergence(location.state.livePrerequisitesToShow).then(response => {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
          console.log('DEV: chart response', response);
        if (Array.isArray(response) && response.length > 0) {
          initializeData(response);
          setLoading(false);
        }
      });
    } else if (location?.state?.simulatedPrerequisitesToShow) {
      setChartType('simulatedPrerequisite');
      setShowDivergenceTable(true);
      setShowReportMissedItems(false);
      exchangeServices.getChartDataByDivergence(location.state.simulatedPrerequisitesToShow).then(response => {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
          console.log('DEV: chart response', response);
        if (Array.isArray(response) && response.length > 0) {
          initializeData(response);
          setLoading(false);
        }
      });
    } else if (values?.id) {
      let service;
      if (values?.type === 'oldPrerequisite') {
        setShowDivergenceTable(false);
        setShowReportMissedItems(true);
        setChartType('oldPrerequisite');
        service = scalpServices.getOldPrerequisite(values.id);
      } else if (values?.type === 'prerequisite') {
        setShowReportMissedItems(false);
        setShowDivergenceTable(true);
        setChartType('prerequisite');
        scalpServices.getPrerequisite(values.id).then(data => {
          exchangeServices.getChartDataByDivergence(data).then(response => {
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
              console.log('DEV: chart response', response);
            if (Array.isArray(response) && response.length > 0) {
              initializeData(response);
              setLoading(false);
            }
          });
        })
      } else if (values?.type === 'livePrerequisite') {
        setShowReportMissedItems(false);
        setShowDivergenceTable(true);
        setChartType('livePrerequisite');
        divergenceServices.getDivergence(values.id).then(data => {
          exchangeServices.getChartDataByDivergence(data).then(response => {
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
              console.log('DEV: chart response', response);
            if (Array.isArray(response) && response.length > 0) {
              initializeData(response);
              setLoading(false);
            }
          });
        })
      } else if (values?.type === 'simulatedPrerequisite') {
        setShowReportMissedItems(false);
        setShowDivergenceTable(true);
        setChartType('simulatedPrerequisite');
        simulationServices.getDivergence(values.id).then(data => {
          exchangeServices.getChartDataByDivergence(data).then(response => {
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
              console.log('DEV: chart response', response);
            if (Array.isArray(response) && response.length > 0) {
              initializeData(response);
              setLoading(false);
            }
          });
        })
      } else {
        setShowDivergenceTable(false);
        setShowReportMissedItems(true);
        setChartType('position');
        service = scalpServices.getPosition(values.id);
      }

      if (service)
        service.then(data => {
          exchangeServices.getChartDataByPosition(data).then(response => {
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
              console.log('DEV: chart response', response);
            if (Array.isArray(response) && response.length > 0) {
              initializeData(response);
              setMissedDivergenceInterval(response[0].interval);
              setMissedDivergenceSymbol(response[0].symbol);
              setLoading(false);
            }
          });
        });
    } else {
      setFilters(true);
      setLoading(false);
    }
  }, [location])

  useEffect(() => {
    if (data && data.length > 0) {
      loadChartCandles(data[0].id);
    }
  }, [data]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isDarkTheme) {
      setStockOption(prevState => ({
        ...prevState, chart: { ...prevState.chart, backgroundColor: '#202020' }
      }));
    } else {
      setStockOption(prevState => ({
        ...prevState, chart: { ...prevState.chart, backgroundColor: '#ffffff' }
      }));
    }
    if (isDarkTheme != null)
      localStorage.setItem('is-dark-theme', isDarkTheme);
  }, [isDarkTheme]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const tooltipFormat = '<span style="color:{point.color}">●</span> <b> {series.name}</b><br/>Open: {point.open}<br/>High: {point.high}<br/>Low: {point.low}<br/>Close: {point.close}<br/>'
    const candleStickPointFormat = showSizeRatio ? `${tooltipFormat}<b>Size Ratio:</b> {point.sizeRatio}` : tooltipFormat;
    setStockOption(prevState => (
      {
        ...prevState,
        plotOptions: {
          ...prevState.plotOptions,
          candlestick: {
            ...prevState.plotOptions.candlestick,
            tooltip: {
              ...prevState.plotOptions.candlestick.tooltip,
              pointFormat: candleStickPointFormat
            }
          }
        }
      }
    ));
  }, [showSizeRatio]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isDark = localStorage.getItem('is-dark-theme');
    if (isDark && isDark === 'true') {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const loadData = () => {
    setTableLoading(true);
    if (!selectedServerSymbol) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select a Symbol!', life: 3000 });
      return;
    }

    if (!selectedServerInterval) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select a Time frame!', life: 3000 });
      return;
    }

    setIconLoading(true);

    let start = null;
    let end = null;
    let options = null;

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


    if (selectedServerOptionsIds && selectedServerOptionsIds.length > 0)
      options = selectedServerOptionsIds.join();

    if (selectedServerShow) {
      let service;
      if (selectedServerShow === 'livePrerequisite') {
        setShowDivergenceTable(true);
        setShowReportMissedItems(false);
        service = divergenceServices.getPrerequisitesByFilter(options, selectedServerSymbol, selectedServerInterval, start * 1000, end * 1000);
      } else if (selectedServerShow === 'simulatedPrerequisite') {
        setShowDivergenceTable(true);
        setShowReportMissedItems(false);
        service = simulationServices.getPrerequisitesByFilter(options, selectedServerSymbol, selectedServerInterval, start * 1000, end * 1000);
      } else if (selectedServerShow === 'prerequisite') {
        setShowDivergenceTable(true);
        setShowReportMissedItems(false);
        service = scalpServices.getPrerequisitesByFilter(selectedServerSymbol, selectedServerInterval, start * 1000, end * 1000);
      } else if (selectedServerShow === 'oldPrerequisite') {
        setShowDivergenceTable(false);
        setShowReportMissedItems(true);
        service = scalpServices.getOldPrerequisitesByFilter(selectedServerSymbol, selectedServerInterval, start, end);
      } else {
        setShowDivergenceTable(false);
        setShowReportMissedItems(true);
        service = scalpServices.getPositions(null, selectedServerSymbol, selectedServerInterval, start, end, null);
      }

      if (selectedServerShow === 'prerequisite' || selectedServerShow === 'livePrerequisite' || selectedServerShow === 'simulatedPrerequisite') {
        if (service)
          service.then(data => {
            if (Array.isArray(data) && data.length > 0) {
              exchangeServices.getChartDataByDivergence(data).then(response => {
                if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
                  console.log('DEV: chart response', response);
                if (Array.isArray(response) && response.length > 0) {
                  initializeData(response);
                  setIconLoading(false);
                  setShowTable(true);
                  setShowDivergenceTable(true);
                  setTableLoading(false);
                }
              });
            } else {
              setShowTable(false);
              setShowDivergenceTable(false);
              exchangeServices.getChartData(selectedServerSymbol, selectedServerInterval, start, end).then(response => {
                if (Array.isArray(response) && response.length > 0) {
                  initializeData(response);
                  setIconLoading(false);
                  setTableLoading(false);
                }
              });
            }

          });

      }
      else if (selectedServerShow === 'oldPrerequisite' || selectedServerShow === 'position') {
        if (service)
          service.then(data => {
            if (Array.isArray(data) && data.length > 0) {
              exchangeServices.getChartDataByPosition(data).then(response => {
                if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
                  console.log('DEV: chart response', response);
                if (Array.isArray(response) && response.length > 0) {
                  initializeData(response);
                  setMissedDivergenceInterval(response[0].interval);
                  setMissedDivergenceSymbol(response[0].symbol);
                  setIconLoading(false);
                  setShowTable(true);
                  setShowDivergenceTable(false);
                  setTableLoading(false);
                }
              });
            } else {
              setShowTable(false);
              setShowDivergenceTable(false);
              exchangeServices.getChartData(selectedServerSymbol, selectedServerInterval, start, end).then(response => {
                if (Array.isArray(response) && response.length > 0) {
                  initializeData(response);
                  setIconLoading(false);
                  setTableLoading(false);
                }
              });
            }
          });

      }

    } else {
      setShowTable(false);
      setShowDivergenceTable(false);
      exchangeServices.getChartData(selectedServerSymbol, selectedServerInterval, start, end)
        .then(response => {
          if (Array.isArray(response) && response.length > 0) {
            initializeData(response);
            setIconLoading(false);
            setTableLoading(false);
          }
        });
    }

    setMissedDivergenceInterval(selectedServerInterval);
    setMissedDivergenceSymbol(selectedServerSymbol);

  }

  const initializeData = (response) => {
    setData(response);
    var cat = response.map(r => { return { name: r.name, key: r.id } });
    if (Array.isArray(cat) && cat.length > 0) {
      setCategories(cat);
      setSelectedCategory(cat[0]);
    }
  }

  const loadChartCandles = (id) => {
    setTableLoading(true);
    let res = data.find(x => x.id === id);
    let series = [];
    if (res.data?.candleData && res.data.candleData.length > 0) {
      series.push({
        positions: res.positions,
        data: res.data.candleData,
        turboThreshold: res.data.candleData.length,
        type: 'candlestick',
        name: `${res.name}`,
        id: `${res.symbol}_${res.interval}`,
        clip: false
      });
    }

    if (res.data?.histogramMacdData && res.data.histogramMacdData.length > 0) {
      series.push({
        data: res.data.histogramMacdData,
        turboThreshold: res.data.histogramMacdData.length,
        type: 'column',
        name: 'MACD Histogram',
        id: `${res.symbol}_${res.interval}_MACD`,
        yAxis: 1,
        linkedTo: `${res.symbol}_${res.interval}`
      });
    }

    if (res.data?.normalMacdData && res.data.normalMacdData.length > 0) {
      series.push({
        data: res.data.normalMacdData,
        turboThreshold: res.data.normalMacdData.length,
        type: 'spline',
        name: 'MACD',
        id: `${res.symbol}_${res.interval}_NormalMACD`,
        yAxis: 1,
        linkedTo: `${res.symbol}_${res.interval}_MACD`
      });
    }

    setCandlesSeries(series);
    setChartEnd(res.chartEnd);
    let min = res.chartStart;
    let max = res.chartEnd;
    stockOptions.xAxis.min = min;
    stockOptions.xAxis.max = max;
    setStockOption(prevState => ({
      ...prevState, series,
      xAxis: { ...prevState.xAxis, min, max }
    }));
    if (Array.isArray(res.positions) && res.positions.length > 0) {
      res.positions[0].isHidden = false;
      loadChartPositions([res.positions[0]], [...series], false, res.chartEnd);
    }
    setTableData(res.positions);
    setTableLoading(false);
  }

  const loadChartPositions = (positions, candlesSeries, idToVisib, chartEnd) => {
    let series = [...candlesSeries];
    let min = stockOptions.xAxis.min;
    let max = stockOptions.xAxis.max;
    if (positions && positions.length > 0) {
      positions.forEach((p) => {
        series.push({
          type: 'line',
          color: '#00a9bb',
          marker: {
            symbol: 'square'
          },
          id: `${p.id}_Price`,
          name: `Position Id: ${p.id}`,
          data: [
            {
              x: (p.divergenceStartDate || p.startDate) * 1000,
              y: (p.divergenceType || p.type).includes('+') ? p.divStartNode?.low : p.divStartNode?.high
            },
            {
              x: (p.divergenceEndDate || p.endDate) * 1000,
              y: (p.divergenceType || p.type).includes('+') ? p.divEndNode?.low : p.divEndNode?.high
            }
          ],
          linkedTo: `${p.symbol}_${p.timeFrameStr}`
        });

        if (p.id === idToVisib) {
          min = p.chartViewStart;
          max = p.chartViewEnd;
        }

        series.push({
          type: 'line',
          color: '#00a9bb',
          marker: {
            symbol: 'square'
          },
          id: `${p.id}_MACD`,
          name: `Position Id: ${p.id}`,
          data: [
            {
              x: p.macdStartNode?.x,
              y: p.macdStartNode?.y
            },
            {
              x: p.macdEndNode?.x,
              y: p.macdEndNode?.y
            }
          ],
          yAxis: 1,
          linkedTo: `${p.symbol}_${p.timeFrameStr}_MACD`
        });

        if (p.refCandleDate) {
          series.push({
            type: 'flags',
            data: [{
              x: p.refCandleDate * 1000,
              title: 'Ref',
              text: `Position Id: ${p.id}`
            }],
            id: `${p.id}_flags`,
            //onSeries: `${res.symbol}_${res.interval}`,
            linkedTo: `${p.symbol}_${p.timeFrameStr}`,
            shape: 'circlepin',
            width: 20
          });

          if (p.triggerDate) {
            series.push({
              type: 'flags',
              data: [{
                x: p.triggerDate * 1000,
                title: 'Trigger',
                text: `Position Id: ${p.id}`
              }],
              id: `${p.id}_trigger_flags`,
              linkedTo: `${p.symbol}_${p.timeFrameStr}`,
              onSeries: 'dataseries',
              shape: 'squarepin',
              yAxis: 1,
              width: 40,
              color: "blue",
              fillColor: "white",
            });
          }

          if (p.trigger) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#F7FF00',
                marker: {
                  symbol: 'diamond'
                },
                id: `${p.id}_diamond`,
                name: `Trigger for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.trigger
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.trigger
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#F7FF00',
                marker: {
                  symbol: 'diamond'
                },
                id: `${p.id}_diamond`,
                name: `Trigger for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.trigger
                  },
                  {
                    x: chartEnd,
                    y: p.trigger
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.target) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#00FF3C',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_triangle`,
                name: `Target for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.target
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.target
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#00FF3C',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_triangle`,
                name: `Target for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.target
                  },
                  {
                    x: chartEnd,
                    y: p.target
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.stopLoss) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#FF002B',
                marker: {
                  symbol: 'triangle-down'
                },
                id: `${p.id}_triangle-down`,
                name: `StopLoss for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopLoss
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.stopLoss
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#FF002B',
                marker: {
                  symbol: 'triangle-down'
                },
                id: `${p.id}_triangle-down`,
                name: `StopLoss for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopLoss
                  },
                  {
                    x: chartEnd,
                    y: p.stopLoss
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.riskFree) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#FF7E00',
                dashStyle: 'shortDash',
                id: `${p.id}_risk-free`,
                name: `Risk Free for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.riskFree
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.riskFree
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#FF7E00',
                dashStyle: 'shortDash',
                id: `${p.id}_risk-free`,
                name: `Risk Free for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.riskFree
                  },
                  {
                    x: chartEnd,
                    y: p.riskFree
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.exitDate) {
            series.push({
              type: 'flags',
              data: [{
                x: p.exitDate * 1000,
                title: 'Exit',
                text: `Position Id: ${p.id}`
              }],
              id: `${p.id}_exit_flags`,
              //onSeries: `${res.symbol}_${res.interval}`,
              linkedTo: `${p.symbol}_${p.timeFrameStr}`,
              shape: 'squarepin',
              width: 20
            });
          }

          if (p.stopTrailTarget && p.stopTrailTarget > 0) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#00FF3C',
                dashStyle: 'shortDash',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_stopTrailTarget`,
                name: `Stop Trail Target for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopTrailTarget
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.stopTrailTarget
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#00FF3C',
                dashStyle: 'shortDash',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_stopTrailTarget`,
                name: `Stop Trail Target for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopTrailTarget
                  },
                  {
                    x: chartEnd,
                    y: p.stopTrailTarget
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.stopTrailStop && p.stopTrailStop > 0) {
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#FF002B',
                dashStyle: 'shortDash',
                marker: {
                  symbol: 'triangle-down'
                },
                id: `${p.id}_stopTrailStop`,
                name: `Stop Trail Stop for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopTrailStop
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: p.stopTrailStop
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#FF002B',
                dashStyle: 'shortDash',
                marker: {
                  symbol: 'triangle-down'
                },
                id: `${p.id}_stopTrailStop`,
                name: `Stop Trail Stop for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: p.stopTrailStop
                  },
                  {
                    x: chartEnd,
                    y: p.stopTrailStop
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (values?.rewardToRisk || location?.state?.rewardToRisk) {
            let rewardToRiskTemp = parseInt(values?.rewardToRisk || location?.state?.rewardToRisk);
            let targetRewardToRisk = ((p.trigger - p.stopLoss) * rewardToRiskTemp) + p.trigger;
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDash',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_analyticRewardToRisk`,
                name: `Analytic Potential R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDash',
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_analyticRewardToRisk`,
                name: `Analytic Potential R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: chartEnd,
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
            p.isPotentialRewardToRiskHidden = false;
            p.isMaxRewardToRiskHidden = true;
          }

          if (p.maxRewardToRisk) {
            let targetRewardToRisk = ((p.trigger - p.stopLoss) * p.maxRewardToRisk) + p.trigger;
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDashDot',
                visible: !p.isMaxRewardToRiskHidden,
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_maxRewardToRisk`,
                name: `Max R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDashDot',
                visible: !p.isMaxRewardToRiskHidden,
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_maxRewardToRisk`,
                name: `Max R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: chartEnd,
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }

          if (p.potentialRewardToRisk) {
            let targetRewardToRisk = ((p.trigger - p.stopLoss) * p.potentialRewardToRisk) + p.trigger;
            if (p.exitDate) {
              let time = (p.exitDate + p.timeFrameNumber * 60 * 5) * 1000;
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDashDotDot',
                visible: !p.isPotentialRewardToRiskHidden,
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_potentialRewardToRisk`,
                name: `Potential R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: time - (time % (p.timeFrameNumber * 60000)),
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            } else {
              series.push({
                type: 'line',
                color: '#1D7A33',
                dashStyle: 'longDashDotDot',
                visible: !p.isPotentialRewardToRiskHidden,
                marker: {
                  symbol: 'triangle'
                },
                id: `${p.id}_potentialRewardToRisk`,
                name: `Potential R/R for position Id: ${p.id}`,
                data: [
                  {
                    x: p.refCandleDate * 1000,
                    y: targetRewardToRisk
                  },
                  {
                    x: chartEnd,
                    y: targetRewardToRisk
                  }
                ],
                linkedTo: `${p.symbol}_${p.timeFrameStr}`
              });
            }
          }
        }
      });
    }

    setStockOption(prevState => ({
      ...prevState, series,
      xAxis: { ...prevState.xAxis, min, max }
    }));

    chart.current?.chart.xAxis[0].setExtremes(min, max);
  }

  const onCategoryChanged = (e) => {
    loadChartCandles(e.value.key);
    setSelectedCategory(e.value);
    var array = e.value.key?.split["_"];
    if (Array.isArray(array) && array.length === 2) {
      setMissedDivergenceSymbol(array[0]);
      setMissedDivergenceInterval(array[1]);
    }
  }

  const colorizeRow = (rowData) => {
    if (rowData.registeredInMarket && location?.state?.rewardToRisk) {
      if (rowData.potentialRewardToRisk >= location?.state?.rewardToRisk)
        return { 'succeed': true }
      else if (rowData.potentialRewardToRisk < location?.state?.rewardToRisk)
        return { 'failed': true }
    }
    else if (rowData.registeredInMarket) {
      if (rowData.rewardToRisk > 0)
        return { 'succeed': true }
      else if (rowData.rewardToRisk < 0)
        return { 'failed': true }
    }
  }

  const optionsTemplate = (rowData) => {
    var option = optionsIds.find(x => x.value === rowData.optionsId);
    if (option)
      return option.label;
    return rowData.optionsId;
  }

  ////////
  const actionBodyTemplateScalp = (rowData) => {
    if (rowData == null || rowData.isConfirmed == null) {
      return (
        <div className="p-d-flex">
          <Button type="button" tooltip="Comments & Confirmations" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-comments" className="p-button-text" onClick={() => setClickedRowId(rowData.id)} />
          <Button type="button" tooltip="Confirm" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-check" className="p-button-rounded p-button-success p-button-text" onClick={() => confirmReview(rowData.id)} />
          <Button type="button" tooltip="Reject" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" onClick={() => rejectReview(rowData.id)} />
        </div>
      );
    } else if (rowData.isConfirmed) {
      return (
        <div className="p-d-flex">
          <Button type="button" tooltip="Comments & Confirmations" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-comments" className="p-button-text" onClick={() => setClickedRowId(rowData.id)} />
          <Button type="button" tooltip="Reject" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" onClick={() => rejectReview(rowData.id)} />
        </div>
      );
    } else {
      return (
        <div className="p-d-flex">
          <Button type="button" tooltip="Comments & Confirmations" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-comments" className="p-button-text" onClick={() => setClickedRowId(rowData.id)} />
          <Button type="button" tooltip="Confirm" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 15 }} icon="pi pi-check" className="p-button-rounded p-button-success p-button-text" onClick={() => confirmReview(rowData.id)} />
        </div>
      );
    }
  }

  const rejectReview = (id) => {
    setTableLoading(true);
    let service;
    if (chartType === 'livePrerequisite') {
      service = divergenceServices.rejectDivergenceAnalyze(id);
    }
    else if (chartType === 'simulatedPrerequisite') {
      service = simulationServices.rejectDivergenceAnalyze(id);
    }
    else if (chartType === 'prerequisite') {
      service = scalpServices.rejectPrerequisiteAnalyze(id);
    }
    else {
      service = scalpServices.rejectPositionAnalyze(id);
    }
    service.then((data) => {
      if (Array.isArray(data)) {
        toast.current.show(data.map(x => ({
          severity: "error",
          detail: `${x}`,
          life: 5000
        })))
        setTableLoading(false);
      } else {
        toast.current.show({ severity: 'success', summary: 'Rejected', detail: 'Your rejection has been saved successfully!', life: 3000 });
        let data = [...tableData]
        var div = data.find(d => d.id === id);
        if (div) {
          div.isConfirmed = false;
          div.isReviewed = true;
        }
        setTableData(data);
        setTableLoading(false);
      }
    });
  }

  const confirmReview = (id) => {
    setTableLoading(true);
    let service;
    if (chartType === 'livePrerequisite') {
      service = divergenceServices.confirmDivergenceAnalyze(id);
    }
    else if (chartType === 'simulatedPrerequisite') {
      service = simulationServices.confirmDivergenceAnalyze(id);
    }
    else if (chartType === 'prerequisite') {
      service = scalpServices.confirmPrerequisiteAnalyze(id);
    }
    else {
      service = scalpServices.confirmPositionAnalyze(id);
    }
    service.then((data) => {
      if (Array.isArray(data)) {
        toast.current.show(data.map(x => ({
          severity: "error",
          detail: `${x}`,
          life: 5000
        })))
        setTableLoading(false);
      } else {
        toast.current.show({ severity: 'success', summary: 'Confirmed', detail: 'Your confirmation has been saved successfully!', life: 3000 });
        let data = [...tableData]
        var div = data.find(d => d.id === id);
        if (div) {
          div.isConfirmed = true;
          div.isReviewed = true;
        }
        setTableData(data);
        setTableLoading(false);
      }
    });
  }

  ///////////
  const onPositionClick = (id) => {
    setTableLoading(true);
    let items = [...tableData];
    let item = items.find(x => x.id === id);
    item.isHidden = !item.isHidden;
    setTableData(items);
    setTableLoading(false);
    var visiblePositions = items.filter(x => !x.isHidden);
    loadChartPositions(visiblePositions, candlesSeries, item.isHidden ? null : item.id, chartEnd);
  }

  const positionMaxRewardToRisk = (id) => {
    var maxRewardToRiskSerie = chart.current?.chart.get(`${id}_maxRewardToRisk`);
    if (maxRewardToRiskSerie) {
      setTableLoading(true);
      let items = [...tableData];
      let item = items.find(x => x.id === id);
      if (maxRewardToRiskSerie.visible) {
        maxRewardToRiskSerie.hide();
        item.isMaxRewardToRiskHidden = true;
      }
      else {
        maxRewardToRiskSerie.show();
        item.isMaxRewardToRiskHidden = false;
      }
      setTableData(items);
      setTableLoading(false);
    }
  }

  const positionPotentialRewardToRisk = (id) => {
    var potentialRewardToRiskSerie = chart.current?.chart.get(`${id}_potentialRewardToRisk`);
    if (potentialRewardToRiskSerie) {
      setTableLoading(true);
      let items = [...tableData];
      let item = items.find(x => x.id === id);
      if (potentialRewardToRiskSerie.visible) {
        potentialRewardToRiskSerie.hide();
        item.isPotentialRewardToRiskHidden = true;
      }
      else {
        potentialRewardToRiskSerie.show();
        item.isPotentialRewardToRiskHidden = false;
      }
      setTableData(items);
      setTableLoading(false);
    }
  }

  const updateIsReviewed = (id, isReviewed) => {
    setTableLoading(true);
    let items = [...tableData];
    let item = items.find(x => x.id === id);
    item.isReviewed = isReviewed;
    setTableData(items);
    setTableLoading(false);
  }

  const updateIsConfirmed = (id, isConfirmed) => {
    setTableLoading(true);
    let items = [...tableData];
    let item = items.find(x => x.id === id);
    item.isConfirmed = isConfirmed;
    setTableData(items);
    setTableLoading(false);
  }

  const visibilityTemplate = (rowData) => {
    return <Button icon={`pi ${rowData.isHidden ? 'pi-eye-slash' : 'pi-eye'}`} className={`p-button-rounded p-button-text visibility-toggler ${rowData.isHidden ? 'is-hidden' : 'is-visible'}`} onClick={() => onPositionClick(rowData.id)} />
  }

  const maxRewardToRiskVisibilityTemplate = (rowData) => {
    return <Button icon={`pi ${rowData.isMaxRewardToRiskHidden ? 'pi-eye-slash' : 'pi-eye'}`} className={`p-button-rounded p-button-text visibility-toggler ${rowData.isMaxRewardToRiskHidden ? 'is-hidden' : 'is-visible'}`} onClick={() => positionMaxRewardToRisk(rowData.id)} />
  }

  const potentialRewardToRiskVisibilityTemplate = (rowData) => {
    return <Button icon={`pi ${rowData.isPotentialRewardToRiskHidden ? 'pi-eye-slash' : 'pi-eye'}`} className={`p-button-rounded p-button-text visibility-toggler ${rowData.isPotentialRewardToRiskHidden ? 'is-hidden' : 'is-visible'}`} onClick={() => positionPotentialRewardToRisk(rowData.id)} />
  }

  const prerequisiteTemplate = (rowData) => {
    return rowData.prerequisiteId && <a target="_blank" rel="noreferrer"
      href={`${window.location.origin}/chart?id=${rowData.prerequisiteId}&type=prerequisite`}><FontAwesomeIcon icon="eye" /></a>
  }

  const visibilityHeaderTemplate = <Button icon={`pi ${visibilityToggle ? 'pi-eye-slash' : 'pi-eye'}`} className={`p-button-rounded p-button-text visibility-toggler ${visibilityToggle ? 'is-hidden' : 'is-visible'}`} onClick={() => setVisibilityToggle(prevState => !prevState)} />

  //////////////////////

  const strategyNameBodyTemplate = (rowData) => {
    if (rowData.strategyId) {
      var find = strategyNames.find(x => x.value === rowData.strategyId);
      return find?.label ?? "";
    }
    return "";
  }

  const backtestNameBodyTemplate = (rowData) => {
    if (rowData.simulationId) {
      var find = backtestNames.find(x => x.value === rowData.simulationId);
      return find?.label ?? "";
    }
    return "";
  }

  const divergenceColumns = [
    {
      ...columnHelper.defaultColumn,
      columnKey: "toggleVisibility",
      style: { 'minWidth': '50px', width: '50px' },
      body: visibilityTemplate,
      header: visibilityHeaderTemplate,
    },

    {
      ...columnHelper.defaultColumn,
      columnKey: "actions",
      header: "Actions",
      body: actionBodyTemplateScalp,
      style: { 'minWidth': '50px', width: '120px' },
      bodyStyle: { justifyContent: 'center', overflow: 'visible' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "isReviewed",
      header: "Is Reviewed",
      sortable: true,
      body: templates.booleanBodyTemplate,
      bodyStyle: { justifyContent: 'center' },
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "id",
      header: "Id",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "symbol",
      header: "Symbol",
      sortable: true,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "timeFrame",
      header: "Time Frame",
      sortable: true,
      style: { 'minWidth': '50px', width: '110px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "divergenceType",
      header: "Divergence Type",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldPriceDate",
      header: "Old Price Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "livePriceDate",
      header: "Live Price Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldMacdDate",
      header: "Old Macd Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "liveMacdDate",
      header: "Live Macd Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldPriceValue",
      header: "Old Price Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "livePriceValue",
      header: "Live Price Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldMacdValue",
      header: "Old Macd Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "liveMacdValue",
      header: "Live Macd Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "priceDifferenceValue",
      header: "Price Difference Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "macdDifferenceValue",
      header: "Macd Difference Value",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "liveGroupStartDate",
      header: "Live Group Start Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldGroupStartDate",
      header: "Old Group Start Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "oldGroupEndDate",
      header: "Old Group End Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "phaseStartDate",
      header: "Phase Start Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "liveCandleMacdEntryAngle",
      header: "Live Candle Macd Entry Angle",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "liveCandleMacdExitAngle",
      header: "Live Candle Macd Exit Angle",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "macdLineDirectionChangeDate",
      header: "Macd Line Direction Change Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "phaseName",
      header: "Phase Name",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "creationDate",
      header: "Creation Date",
      sortable: true,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "optionsId",
      header: "Option",
      sortable: true,
      body: optionsTemplate,
      style: { 'minWidth': '50px', width: '130px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "histogramNumberBasedOnLivePrice",
      header: "Histogram Number Based On Live Price",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "histogramNumberBasedOnLiveMacd",
      header: "Histogram Number Based On Live Macd",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "candleGapCount",
      header: "Candle Gap Count",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '110px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "macdGapCount",
      header: "Macd Gap Count",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '110px' },
      bodyStyle: { justifyContent: 'center' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "hasProperOverlap",
      header: "Has Proper Overlap",
      sortable: true,
      body: templates.booleanBodyTemplate,
      style: { 'minWidth': '80px', width: '140px' },
      bodyStyle: { justifyContent: 'center' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "peakCandleDate",
      header: "Peak Candle Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "candlesBeforePeak",
      header: "Candles Before Peak",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '80px' },
      bodyStyle: { justifyContent: 'center' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "candlesAfterPeak",
      header: "Candles After Peak",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '80px' },
      bodyStyle: { justifyContent: 'center' }
    },

    {
      ...columnHelper.defaultColumn,
      field: "slowCorrectionElongation",
      header: "Slow Correction Elongation",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '80px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "lowerTimeFrameOnePhaseDivergence",
      header: "Lower Time Frame One Phase Divergence",
      sortable: true,
      body: templates.commaBodyTemplate,
      style: { 'minWidth': '50px', width: '180px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "lowerTimeFrameTwoPhasesDivergence",
      header: "Lower Time Frame Two Phases Divergence",
      sortable: true,
      body: templates.commaBodyTemplate,
      style: { 'minWidth': '50px', width: '180px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "macdDifferencePercentage",
      header: "Macd Difference Percentage",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "priceDifferencePercentage",
      header: "Price Difference Percentage",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "macdHistogramDirectionChangeDate",
      header: "Macd Histogram Direction Change Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "middlePhaseMacdCount",
      header: "Middle Phase Macd Count",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "histogramConfirmationDelayString",
      header: "Histogram Confirmation Delay",
      sortable: true,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "strategyId",
      header: "Strategy Id",
      sortable: true,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "strategyName",
      header: "Strategy Name",
      sortable: true,
      body: strategyNameBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "simulationId",
      header: "Backtest Id",
      sortable: true,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "simulationName",
      header: "Backtest Name",
      sortable: true,
      body: backtestNameBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' },
      bodyStyle: { justifyContent: 'center' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "isProcessed",
      header: "Is Processed",
      sortable: true,
      body: templates.booleanBodyTemplate,
      bodyStyle: { justifyContent: 'center' },
      style: { 'minWidth': '50px', width: '80px' }
    },
  ]

  const serverCustomableFilters = [
    {
      name: "symbol",
      label: "Symbols",
      type: FilterType.DropDown,
      options: exchangeSymbols,
      state: selectedServerSymbol,
      setState: setSelectedServerSymbol
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
      name: "show",
      label: "Show",
      type: FilterType.DropDown,
      options: show,
      state: selectedServerShow,
      setState: setSelectedServerShow
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
    }
  ]

  const divergenceHeader = (
    <div className="table-header-container flex flex-wrap align-items-center">
      <Button type="button" icon="pi pi-file-excel" onClick={() => Export.exportExcel(tableData, "chart-divergnece")} className="p-button-info" data-pr-tooltip="XLS" />
      <ColumnManager columns={divergenceColumns} dataTableName="dt-state-chart-divergence" setSortState={setMultiSortMeta}
        onSave={() => setTableData(prevState => [...prevState])} buttonClassNames="ml-auto" />
    </div>
  );

  ////////////////////////////////////
  const toggleThemes = () => {
    setIsDarkTheme(prevState => !prevState);
  }
  ////////////////////////////////////
  let table;
  if (showDivergenceTable) {
    table = <DataTable id="chart-divergence" value={tableData} className="p-datatable-sm mb-7" scrollable showGridlines scrollDirection="both"
      contextMenuSelection={selectedContent} sortMode="multiple" rowClassName={colorizeRow} scrollHeight="550px"
      onContextMenuSelectionChange={e => setSelectedContent(e)} loading={tableLoading}
      multiSortMeta={multiSortMeta} onSort={(e) => setMultiSortMeta(e.multiSortMeta)}
      cellClassName={(data, options) => options.field}
      onContextMenu={e => cm.current.show(e.originalEvent)} header={divergenceHeader}>

      {columnHelper.generatColumns(divergenceColumns, "dt-state-chart-divergence")}


    </DataTable>
  } else {
    table = <PositionTable loading={tableLoading} setLoading={setTableLoading} positions={tableData} setPositions={setTableData}
      tableStateName="dt-state-chart-positions" dataTableName="dt-state-chart-positions" filter={false} isChart={true}
      visibilityTemplate={visibilityTemplate} visibilityHeaderTemplate={visibilityHeaderTemplate}
      actionBodyTemplateScalp={actionBodyTemplateScalp} prerequisiteTemplate={prerequisiteTemplate}
      maxRewardToRiskVisibilityTemplate={maxRewardToRiskVisibilityTemplate} potentialRewardToRiskVisibilityTemplate={potentialRewardToRiskVisibilityTemplate} />
  }

  if (loading === true) {
    return (
      <div className="flex align-items-baseline justify-content-center pt-6 loading-container">
        <Skeleton width="3rem" height="5rem" className="m-1" />
        <Skeleton width="2rem" height="10rem" className="m-1" />
        <Skeleton width="3rem" height="15rem" className="m-1" />
        <Skeleton width="3rem" height="20rem" className="m-1" />
        <Skeleton width="2rem" height="18rem" className="m-1" />
        <Skeleton width="1rem" height="13rem" className="m-1" />
        <Skeleton width="3rem" height="8rem" className="m-1" />
        <Skeleton width="1rem" height="12rem" className="m-1" />
        <Skeleton width="1rem" height="16rem" className="m-1" />
        <Skeleton width="2rem" height="5rem" className="m-1" />
        <Skeleton width="2rem" height="10rem" className="m-1" />
        <Skeleton width="3rem" height="14rem" className="m-1" />
        <Skeleton width="1rem" height="7rem" className="m-1" />
      </div>
    )
  } else {
    return (
      <div id='stockChart-container'>
        {filters && <Card style={{ width: '100%', marginBottom: '2em' }}>
          <div className="grid p-fluid">
            <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
              <label htmlFor="serverSymbol" className="align-self-baseline">Symbol</label>
              <Dropdown id='serverSymbol' value={selectedServerSymbol} options={symbols} filter showClear
                onChange={(e) => setSelectedServerSymbol(e.value)} placeholder="Select Symbols" className="w-full align-self-end" />
            </div>
            <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
              <label htmlFor="serverInterval" className="align-self-baseline">Time Frame</label>
              <Dropdown id='serverInterval' value={selectedServerInterval} options={intervals} filter showClear
                onChange={(e) => setSelectedServerInterval(e.value)} placeholder="Select a Time Frame" className="w-full align-self-end" />
            </div>
            <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
              <label htmlFor="serverShow" className="align-self-baseline">Show</label>
              <Dropdown id='serverShow' value={selectedServerShow} options={show} filter showClear
                onChange={(e) => setSelectedServerShow(e.value)} placeholder="Show" className="w-full align-self-end" />
            </div>
            {showServerOptions && <div className="col-12 md:col-6 lg:col-3 flex flex-wrap">
              <label htmlFor="optionsIds" className="align-self-baseline">Options</label>
              <MultiSelect id='optionsIds' value={selectedServerOptionsIds} options={optionsIds} filter showClear
                onChange={(e) => setSelectedServerOptionsIds(e.value)} placeholder="Select Options" className="w-full align-self-end" />
            </div>}
            {!showServerOptions && <div className="col-12 hidden md:col-3 lg:col-3 lg:block"></div>}
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
            <div className="p-field col-12 md:col-12 flex">
              <Button type="button" label="Show Chart" className="p-button-raised ml-auto" loading={iconLoading}
                icon="pi pi-search" onClick={() => loadData()} style={{ 'width': 'unset' }} />
              <FilterManager filters={serverCustomableFilters} stateName="server-filters-stock-chart"
                onSave={loadData} />
            </div>
          </div>
        </Card>}
        <Button label="Dark/Light" className="p-button-outlined mb-2 p-button-sm" onClick={toggleThemes} />
        <div className="field-checkbox">
          <Checkbox inputId="showSizeRatio" onChange={e => setShowSizeRatio(e.checked)} checked={showSizeRatio} />
          <label htmlFor="showSizeRatio">Show Size Ratio</label>
        </div>

        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={stockOptions}
          ref={chart} />
        {!filters && <div className="card flex flex-wrap m-2">
          {
            categories.map((category) => {
              return (
                <div key={category.key} className="p-field-radiobutton m-1">
                  <RadioButton inputId={category.key} name="category" value={category} onChange={onCategoryChanged} checked={selectedCategory?.key === category.key} />
                  <label className="font-bold pl-1" htmlFor={category.key}>{category.name}</label>
                </div>
              )
            })
          }
        </div>}
        <Toast ref={toast} />
        <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedContent(null)} />
        {showTable && table}
      </div>
    )
  }
}

export default StockChart