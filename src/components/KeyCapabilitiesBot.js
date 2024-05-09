import React from 'react';
import { ScrollPanel } from 'primereact/scrollpanel';

const KeyCapabilitiesBot = () => {
    return (
        <div className="scrollpanel">
            <div className="card">
                <div className="grid">
                    <div className="col-12 md:col-12">
                        <h5>Key Bot Capabilities</h5>
                        <ScrollPanel style={{ width: '100%', height: '225px' }} className="custombar1">
                            <div style={{ padding: '1em', lineHeight: '1.5' }}>
                                <ul>
                                    <li>Trading system (divergence, color change candle)</li>
                                    <li>Capital management system</li>
                                    <li>Show position and divergence on the chart</li>
                                    <li>Robot activity report (statistical report)</li>
                                    <li>Setting positions in exchange</li>
                                    <li>Activate and deactivate the trade at specified intervals</li>
                                    <li>User management</li>
                                    <li>Divergence simulator</li>
                                    <li>Free risk capability</li>
                                    <li>Position entry management based on performance</li>
                                    <li>Management of robot activity based on the amount of capital (deactivation after losing a certain percentage of capital)</li>
                                    <li>Send reports via telegram and SMS</li>
                                </ul>
                            </div>
                        </ScrollPanel>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default KeyCapabilitiesBot;