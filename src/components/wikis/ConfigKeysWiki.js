import React from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { scalpServices } from '../../services/ScalpServices';
import ConfigKeyCard from '../ConfigKeyCard';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';

const ConfigKeysWiki = () => {
    const [loading, setLoading] = React.useState(false);
    const [filterText, setFilterText] = React.useState();
    const [data, setData] = React.useState([]);
    const [clientData, setClientData] = React.useState([]);
    const [devModeData, setDevModeData] = React.useState([]);
    const [showDevMode, setShowDevMode] = React.useState(false);

    React.useEffect(() => {
        loadData();
    }, []);

    React.useEffect(() => {
        const filteredData = filterText && filterText !== ''
            ? data.filter(element => {
                return (element.key && element.key.includes(filterText))
                    || (element.displayName && element.displayName.includes(filterText))
                    || (element.description && element.description.includes(filterText))
            })
            : data;
        setDevModeData(filteredData);
        setClientData(filteredData.filter(function (element) {
            return element.isDeveloperSetting === false;
        }));
    }, [filterText, data]);

    const loadData = async () => {
        setLoading(true);
        scalpServices.getAllConfigKeys().then(data => {
            setData(data.sort(function compare(value1, value2) {
                return (value1.section < value2.section) ?
                    -1 :
                    (value1.section > value2.section) ?
                        1 :
                        (value1.order < value2.order) ?
                            -1 :
                            (value1.order > value2.order) ?
                                1 :
                                0;

            }));
            setLoading(false);
        });
    }

    return (
        loading
            ? <div className="w-full text-center"><ProgressSpinner /></div>
            : <React.Fragment>
                <Tooltip target="#update_configKey_itemTooltip"
                    style={{ wordBreak: 'break-all', maxWidth: 'unset' }} position="top" />
                <div className="card flex flex-wrap">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder='Search' />
                    </span>
                    <div className="flex align-items-center" style={{ 'marginLeft': 'auto' }}>
                        Dev Mode:<InputSwitch className="ml-2" checked={showDevMode} onChange={(e) => setShowDevMode(e.value)} />
                    </div>
                    <div className="flex flex-wrap align-items-baseline flex-wrap flex-1-100 card-container mt-2">
                        <label className="font-bold flex-1-100" >Keys Count: {showDevMode ? devModeData.length : clientData.length}</label>
                        {showDevMode
                            ? devModeData.length > 0 && devModeData.map(configKey =>
                                <ConfigKeyCard key={configKey.id}
                                    id={configKey.id}
                                    section={configKey.section}
                                    configKey={configKey.key}
                                    defaultValue={configKey.defaultValue}
                                    sampleValues={configKey.sampleValues}
                                    displayName={configKey.displayName}
                                    description={configKey.htmlDescription??configKey.description}
                                />)
                            : clientData.length > 0 && clientData.map(configKey =>
                                <ConfigKeyCard key={configKey.id}
                                    id={configKey.id}
                                    section={configKey.section}
                                    configKey={configKey.key}
                                    defaultValue={configKey.defaultValue}
                                    sampleValues={configKey.sampleValues}
                                    displayName={configKey.displayName}
                                    description={configKey.htmlDescription??configKey.description}
                                />)
                        }
                    </div>
                </div>
            </React.Fragment>
    );
}
export default ConfigKeysWiki

