import React from 'react';
import { useLocation } from 'react-router-dom';
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
import { RadioButton } from 'primereact/radiobutton';
import { ContextMenu } from 'primereact/contextmenu';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { contentHelper } from '../utils/ContentHelper';
import { templates } from '../utils/Templates';
import { reflowChart } from '../utils/ReflowChart';
import { sortHelper } from '../utils/SortHelper';
import { columnHelper } from '../utils/ColumnHelper';
import { exchangeServices } from '../services/ExchangeServices';
import { scalpServices } from '../services/ScalpServices';

import '../assets/scss/StockChart.scss';

Indicators(Highcharts);
DragPanes(Highcharts);
AnnotationsAdvanced(Highcharts);
PriceIndicator(Highcharts);
FullScreen(Highcharts);
StockTools(Highcharts);
Exporting(Highcharts);

const OpenTradingChart = () => {

  const cm = React.useRef(null);
  const chart = React.useRef(null);
  const toast = React.useRef(null);
  const location = useLocation();
  const [data, setData] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [selectedContent, setSelectedContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [categories, setCategories] = React.useState([]);

  const defaultOptions = {
    chart: {
      height: "50%"
    },
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: false
        },
        cursor: 'pointer'
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


  const [stockOptions, setStockOption] = React.useState(defaultOptions);

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

  React.useEffect(() => {
    reflowChart.attach(chart);

    scalpServices.getOpenPositions().then((data) => {
      if (Array.isArray(data)) {
        exchangeServices.getChartDataByPosition(data).then(response => {
          if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
            console.log('DEV: chart response', response);
          if (Array.isArray(response) && response.length > 0) {
            initializeData(response);
            setLoading(false);
          }
        });
      }
    })

  }, [location])// eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (data && data.length > 0) {
      loadChartCandles(data[0].id);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeData = (response) => {
    setData(response);
    var cat = response.map(r => { return { name: r.name, key: r.id } });
    if (Array.isArray(cat) && cat.length > 0) {
      setCategories(cat);
      setSelectedCategory(cat[0]);
    }
  }

  const loadChartCandles = (id) => {
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

    //setCandlesSeries(series);
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
      loadChartPositions([res.positions[0]], [...series]);
    }
    setTableData(res.positions);

  }

  const loadChartPositions = (positions, candlesSeries, idToVisib) => {
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

          if (p.trigger) {
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
                  x: (p.refCandleDate + p.timeFrameNumber * 60 * 30) * 1000,
                  y: p.trigger
                }
              ],
              linkedTo: `${p.symbol}_${p.timeFrameStr}`
            });
          }
          if (p.target) {
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
                  x: (p.refCandleDate + p.timeFrameNumber * 60 * 30) * 1000,
                  y: p.target
                }
              ],
              linkedTo: `${p.symbol}_${p.timeFrameStr}`
            });
          }
          if (p.stopLoss) {
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
                  x: (p.refCandleDate + p.timeFrameNumber * 60 * 30) * 1000,
                  y: p.stopLoss
                }
              ],
              linkedTo: `${p.symbol}_${p.timeFrameStr}`
            });
          }
          if (p.riskFree) {
            series.push({
              type: 'line',
              color: '#FF002B',
              dashStyle: 'shortDash',
              id: `${p.id}_risk-free`,
              name: `Risk Free for position Id: ${p.id}`,
              data: [
                {
                  x: p.refCandleDate * 1000,
                  y: p.riskFree
                },
                {
                  x: (p.refCandleDate + p.timeFrameNumber * 60 * 30) * 1000,
                  y: p.riskFree
                }
              ],
              linkedTo: `${p.symbol}_${p.timeFrameStr}`
            });
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
    }
  }

  const columns = [
    {
      ...columnHelper.defaultColumn,
      field: "symbol",
      header: "Symbol",
      sortable: true,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "timeFrameStr",
      header: "Time Frame",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "rewardToRisk",
      header: "R/R",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '80px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "divergenceStartDate",
      header: "Div Start",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "divergenceEndDate",
      header: "Div End",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "refCandleDate",
      header: "Ref Candle",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "trigger",
      header: "Trigger",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "stopLoss",
      header: "Stop Loss",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "target",
      header: "Target",
      sortable: true,
      body: templates.digitBodyTemplate,
      style: { 'minWidth': '50px', width: '100px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "triggerDate",
      header: "Trigger Date",
      sortable: true,
      body: templates.dateBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "exitDate",
      header: "Exit Date",
      body: templates.dateBodyTemplate,
      sortable: true,
      sortFunction: (event) => sortHelper.sort(event, tableData),
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "isReviewed",
      header: "Is Reviewed",
      sortable: true,
      body: templates.booleanBodyTemplate,
      style: { 'minWidth': '50px', width: '120px' }
    },
    {
      ...columnHelper.defaultColumn,
      field: "id",
      header: "Id",
      sortable: true,
      style: { 'minWidth': '50px', width: '80px' }
    },
  ]

  //////////////////////
  let table = <DataTable id="chart-positions" value={tableData} className="p-datatable-sm mb-7" scrollable showGridlines filterDisplay="row" scrollDirection="both"
    contextMenuSelection={selectedContent} sortMode="multiple" scrollHeight="550px"
    onContextMenuSelectionChange={e => setSelectedContent(e)}
    cellClassName={(data, options) => options.field}
    onContextMenu={e => cm.current.show(e.originalEvent)}>

    {columnHelper.generatColumns(columns, "dt-state-open-trading")}

  </DataTable>

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
      <React.Fragment>
        <Card>
          <h5>Open Trading Chart</h5>
          <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={stockOptions}
            ref={chart} />
          {<div className="card flex flex-wrap m-2">
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
          {table}
        </Card>
      </React.Fragment>
    )
  }
}

export default OpenTradingChart