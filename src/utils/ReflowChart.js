export const reflowChart = {
    attach
}
var chartObj;

function attach(chart) {
    var mainContainer = document.getElementById('main-layout');
    chartObj=chart;

    if(mainContainer)
        resizeObserver.observe(mainContainer);
}

const resizeObserver = new ResizeObserver(entries => {
    if(chartObj?.current?.chart)
          chartObj.current.chart.reflow();
});