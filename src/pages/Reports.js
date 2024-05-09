import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import HistogramWinningRatioReport from '../components/reports/HistogramWinningRatioReport';
import HourlyWinLossReport from '../components/reports/HourlyWinLossReport';
import SymbolEfficiencyReport from '../components/reports/SymbolEfficiencyReport';
import PureRewardToRiskDailyReport from '../components/reports/PureRewardToRiskDailyReport';
import ProperElongationReport from '../components/reports/ProperElongationReport';
import BotEfficiencyMonthlyReport from '../components/reports/BotEfficiencyMonthlyReport';
import RefCandlePatternReport from '../components/reports/RefCandlePatternReport';
import '../assets/scss/Reports.scss';
import { Button } from 'primereact/button';
import BestParametersOfStopReport from '../components/reports/BestParametersOfTheStopReport';

const Reports = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [activeReport, setActiveReport] = React.useState(null);

    const reports = [
        {
            label: '1- Hours Efficiency',
            route: '/reports/statistical/1',
            type: 'statistical',
            confirmed: true,
            note: '',
            component: () => <HourlyWinLossReport />
        },
        {
            label: '1- Detect Best R/R Based on Pattern',
            route: '/reports/analytical/1',
            type: 'analytical',
            confirmed: true,
            note: '',
            component: () => <RefCandlePatternReport />
        },
        {
            label: '2- Detect best parameters of the pace time',
            route: '/reports/analytical/2',
            type: 'analytical',
            confirmed: true,
            component: () => <ProperElongationReport />
        },
        {
            label: '4- Detect best parameters of the Stop',
            route: '/reports/analytical/4',
            type: 'analytical',
            confirmed: true,
            component: () => <BestParametersOfStopReport />
        },
        {
            label: '6- Detect golden divergence parameters for two phase divergence',
            route: '/reports/analytical/6',
            type: 'analytical',
            confirmed: true,
            component: () => <HistogramWinningRatioReport />
        },
        {
            label: '7- Symbol Efficiency',
            route: '/reports/analytical/7',
            type: 'analytical',
            confirmed: true,
            note: '',
            component: () => <SymbolEfficiencyReport />
        },
        {
            label: '9- Daily Strategy Efficiency',
            route: '/reports/analytical/9',
            type: 'analytical',
            confirmed: true,
            note: '',
            component: () => <PureRewardToRiskDailyReport />
        },
        {
            label: '10- Monthly Strategy Efficiency',
            route: '/reports/analytical/10',
            type: 'analytical',
            confirmed: true,
            note: '',
            component: () => <BotEfficiencyMonthlyReport />
        },
    ];

    React.useEffect(() => {
        var report = reports.find(r => r.route === pathname);
        setActiveReport(report);
    }, [pathname]);// eslint-disable-line react-hooks/exhaustive-deps



    return (
        <div id="reports-container" className='mt-5'>
            {
                activeReport
                    ? <React.Fragment>
                        <div className='flex flex-wrap justify-content-between align-items-center'>
                            <Button icon="pi pi-chevron-left" className="p-button-rounded p-button-info p-button-lg m-1"
                                type='button' tooltip='Return back to reports lists' aria-label="Return back to reports lists"
                                onClick={() => navigate('/reports')} />
                            <strong className='m-auto'>{activeReport.label}</strong>
                        </div>
                        {activeReport.component()}
                    </React.Fragment>
                    : <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Analytical">
                            <CardsGrid items={reports.filter(r => r.type === 'analytical')} />
                        </TabPanel>
                        <TabPanel header="Statistical">
                            <CardsGrid items={reports.filter(r => r.type === 'statistical')} />
                        </TabPanel>
                    </TabView>
            }
        </div>
    );
}

export default Reports;

const CardsGrid = ({ items }) => {
    const navigate = useNavigate();
    return (<div className='grid'>
        {
            items.map((item, i) => {
                return <div key={i} className='col-12 md:col-6 xl:col-4' onClick={() => navigate(item.route)}>
                    <div className='card'>
                        <div className='flex-1-100 font-bold'>{item.label}</div>
                        {!item.confirmed && <i className='m-2 pi pi-exclamation-triangle text-orange-500'> {item.note}</i>}
                    </div>
                </div>
            })
        }
    </div>);
}