import React from "react";
import LastActivity from '../components/LastActivity';
import MostWinsAndLossesSymbols from '../components/MostWinsAndLossesSymbols';
import DurationOfActivity from '../components/DurationOfActivity';
import OpenTradingChart from '../components/OpenTradingChart';
import RunningTimeFrames from '../components/RunningTimeFrames';
import RunningSymbols from '../components/RunningSymbols';
import TotalInfo from '../components/TotalInfo';
import Contacts from '../components/Contacts';
import KeyCapabilitiesBot from '../components/KeyCapabilitiesBot';
import PureRewardToRiskDailyReport from '../components/reports/PureRewardToRiskDailyReport';
import { Role } from '../utils/Role';
import { accountServices } from '../services/AccountServices';
import BotControl from "../components/BotControl";

const Dashboard = () => {
    return (
        accountServices.currentUserRoles.includes(Role.Plan1)
            ? <React.Fragment>
                <BotControl simplifiedView={true} />
                <PureRewardToRiskDailyReport isDashboard={true} />
            </React.Fragment>
            : <div className="grid p-fluid mt-5 dashboard">
                <TotalInfo />
                <DurationOfActivity />
                <MostWinsAndLossesSymbols />
                <div className="col-12 md:col-12 lg:col-4">
                    <LastActivity />
                    <div className="col-12 lg:col-12 contacts">
                        <Contacts />
                    </div>
                </div>

                <div className="col-12 md:col-12 lg:col-8">
                    <OpenTradingChart />

                    <div className="col-6 lg:col-3 inline-block">
                        <RunningSymbols />
                    </div>

                    <div className="col-6 lg:col-3 inline-block">
                        <RunningTimeFrames />
                    </div>

                    <div className="col-12 lg:col-6 inline-block">
                        <KeyCapabilitiesBot />
                    </div>
                </div>
            </div>
    );
}

export default Dashboard;