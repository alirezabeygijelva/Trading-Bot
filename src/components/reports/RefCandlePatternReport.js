import '../../assets/scss/RefCandlePatternReport.scss';
import { TabView, TabPanel } from 'primereact/tabview';
import BestPatternWithFixRewardToRisk from './BestPatternWithFixRewardToRisk';
import BestRewardToRiskWithPattern from './BestRewardToRiskWithPattern';
import BestRewardToRiskWithoutPattern from './BestRewardToRiskWithoutPattern';
import BestRewardToRiskWithPatternBasedOnSymbol from './BestRewardToRiskWithPatternBasedOnSymbol';

const RefCandlePatternReport = () => {
    return (
        <div className="card">
            <TabView scrollable>
                <TabPanel header="Best results based on fix r/r and pattern">
                    <BestPatternWithFixRewardToRisk />
                </TabPanel>
                <TabPanel header="Best results based on r/r and pattern">
                    <BestRewardToRiskWithPattern />
                </TabPanel>
                <TabPanel header="Best results based on r/r and pattern, grouped by symbol">
                    <BestRewardToRiskWithPatternBasedOnSymbol />
                </TabPanel>
                <TabPanel header="Best results based on r/r">
                    <BestRewardToRiskWithoutPattern />
                </TabPanel>
            </TabView>
        </div>

    )
}

export default RefCandlePatternReport;