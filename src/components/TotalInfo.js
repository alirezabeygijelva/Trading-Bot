import React from "react";
import { scalpServices } from "../services/ScalpServices";
import { accountServices } from "../services/AccountServices";

const TotalInfo = () => {
    const [totalUser, setTotalUser] = React.useState(0);
    const [strategy, setStrategy] = React.useState('--');

    React.useEffect(() => {
        accountServices.getUserCount().then((data) => {
            setTotalUser(data)
        });

        scalpServices.getLatestStrategy().then(data => {
            data?.name && setStrategy(data.name);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <React.Fragment>

            <div className="total-info-main-container">
                <div className="card summary">
                    <div className="info-container">
                        <span className="title">Strategy</span>
                        <span className="count success">{strategy}</span>
                    </div>
                </div>

                <div className="card summary">
                    <div className="info-container">
                        <span className="title">Users</span>
                        <span className="count warning">{totalUser}</span>
                    </div>
                </div>

                <div className="card summary">
                    <div className="info-container">
                        <span className="title">Leverage</span>
                        <span className="count success">20X</span>
                    </div>
                </div>

                <div className="card summary">
                    <div className="info-container">
                        <span className="title">Margin</span>
                        <span className="count warning">ISOLATED</span>
                    </div>
                </div>
            </div>

        </React.Fragment>
    )
}
export default TotalInfo;