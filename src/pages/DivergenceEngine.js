import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import LiveDivergenceResult from './LiveDivergenceResult';
import DivergenceHealthCheck from './DivergenceHealthCheck';
import DivergenceEngineSetup from './DivergenceEngineSetup';
import '../assets/scss/DivergenceEngine.scss';

const DivergenceEngine = () => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    return (
        <div id='divergence-engine-container' className="mt-5">
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Engine Setup">
                    <DivergenceEngineSetup />
                </TabPanel>
                <TabPanel header="Live Divergence">
                    <LiveDivergenceResult />
                </TabPanel>
                <TabPanel header="Health Check">
                    <DivergenceHealthCheck />
                </TabPanel>
            </TabView>
        </div>
    );
}

export default DivergenceEngine;