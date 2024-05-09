export const visibilityDetector = {
    attach
}
var showChart;
var floatingShowChart;
var mainContainer;

function attach(containerId) {
    showChart = document.getElementById('showChart');
    floatingShowChart = document.getElementById('floatingShowChart');
    mainContainer = document.getElementById('main-container');
    window.onresize = visibilityManagement;
    mainContainer.onscroll = visibilityManagement;
    const container = document.getElementById(containerId);
    if (container)
        resizeObserver.observe(container);
    visibilityManagement();
}
const resizeObserver = new ResizeObserver(entries => {
    visibilityManagement();
});

function visibilityManagement() {
    if (floatingShowChart)
        floatingShowChart.style.visibility = isInViewport(showChart) ?
            'hidden' :
            'visible';
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    const main = document.getElementById('main-container');
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || main.clientHeight) &&
        rect.right <= (window.innerWidth || main.clientWidth)
    );
}
