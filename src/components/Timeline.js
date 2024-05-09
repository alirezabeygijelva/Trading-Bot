import React from "react";
import LabelWithValue from './LabelWithValue';

const Timeline = ({ timeline }, ref) => {
    if (ref)
        ref.current = {};

    return (
        <React.Fragment>
            <div className="grid p-fluid">
                <div className="col-12 md:col-4 lg:col-4">
                    <LabelWithValue className="p-inputgroup" displayText="Start Date:" value={timeline.startDate} />
                </div>
                <div className="col-12 md:col-4 lg:col-4">
                    <LabelWithValue className="p-inputgroup" displayText="End Date:" value={timeline.endDate} />
                </div>
                <div className="col-12 md:col-4 lg:col-4">
                    <LabelWithValue className="p-inputgroup" displayText="Duration:" value={timeline.duration} />
                </div>
                <hr className="col"/>
            </div>
        </React.Fragment>
    );
};


Timeline.prototype = {

}

export default React.forwardRef(Timeline);