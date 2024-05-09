import React from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

export const EngineHubContext = React.createContext();

const EngineHubContextProvider = (props) => {
    const [liveBotStatus, setLiveBotStatus] = React.useState(null);
    const [simBotStatus, setSimBotStatus] = React.useState(null);
    const [connection, setConnection] = React.useState(null);
    const [connectionState, setConnectionState] = React.useState(null);
    const [progress, setProgress] = React.useState(null);
    const [botMessage, setBotMessage] = React.useState(null);
    const [runningStrategyId, setRunningStrategyId] = React.useState(0);
    const [activeStrategyChangedTrigger, setActiveStrategyChangedTrigger] = React.useState(false);

    React.useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${process.env.REACT_APP_ENGINE_URL}/hubs/communications`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .build();
        setConnection(newConnection);
    }, []);

    React.useEffect(() => {
        async function start() {
            if (connection) {
                updateConnectionState();
                connection.on('ReceiveMessage', (messageType, message) => {
                    //Success:0
                    //Fail:1
                    //Info:2
                    //Warning:3
                    setBotMessage({ messageType, message });
                });
                connection.on('ReceiveProgress', (simulationId, percentage, message) => {
                    if (!simulationId)
                        simulationId = 0;
                    if (!percentage)
                        percentage = 0;
                    if (!message)
                        message = '';
                    setProgress({ simulationId, percentage, message });
                });
                connection.on('SetLiveBotStatus', (status) => {
                    setLiveBotStatus(status);
                });
                connection.on('SetSimBotStatus', (status) => {
                    setSimBotStatus(status);
                });
                connection.on('SetRunningStrategyId', (strategyId) => {
                    setRunningStrategyId(strategyId);
                });
                connection.on('ActiveStrategyChanged', () => {
                    setActiveStrategyChangedTrigger(prevState => !prevState);
                });
                try {
                    await connection.start();
                } catch (error) {
                    console.error('Connection failed: ', error);
                    setTimeout(start, 1000);
                }
            }
        }
        start();
    }, [connection]);// eslint-disable-line react-hooks/exhaustive-deps

    const updateConnectionState = () => {
        setConnectionState({
            isConnected: connection && connection.state === 'Connected',
            message: connection?.state,
        })
        setTimeout(updateConnectionState, 1000);
    }

    return (
        <EngineHubContext.Provider
            value={{
                connectionState, progress, botMessage,
                liveBotStatus, simBotStatus, runningStrategyId, activeStrategyChangedTrigger
            }}>
            {props.children}
        </EngineHubContext.Provider>
    );
}

export default EngineHubContextProvider;