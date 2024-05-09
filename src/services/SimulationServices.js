import { serviceBase } from './ServiceBase';
export const simulationServices = {
    getDivergence,
    getDivergences,
    getSymbols,
    getSimulations,
    getSimulationNames,
    getOptionsNames,
    getAllSimulation,
    createSimulation,
    getPrerequisitesByFilter,
    getBySimulationId,
    getDivergenceAnalyzes,
    createDivergenceAnalyze,
    updateDivergenceAnalyze,
    deleteDivergenceAnalyze,
    confirmDivergenceAnalyze,
    rejectDivergenceAnalyze,
    initialize,
    stopSimulation,
    progress,
    isActive,
    resetProgress,
    getById,
    updateSimulation,
    deleteSimulation
}


async function getDivergence(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergence/get?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return [response.data];
            }
            return [];
        });
}

async function getDivergences(simulationIds, optionsIds, symbols, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergence/getFiltered?`;

    if (simulationIds)
        url = `${url}simulationIds=${simulationIds}&`;
    if (optionsIds)
        url = `${url}optionsIds=${optionsIds}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate * 1000}&`;
    if (endDate)
        url = `${url}endDate=${endDate * 1000}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getSymbols() {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/symbol/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.name, label: s.name }));
            }
            return [];
        })
}

async function getSimulations() {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name, start: s.start, end: s.end }));
            }
            return [];
        })
}

async function getSimulationNames() {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/getNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        })
}

async function getOptionsNames() {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceOptions/getNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name, fullLabel: s.fullName }));
            }
            return [];
        })
}

async function getAllSimulation() {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/getall`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return []
            //return response;
        });
}

async function createSimulation(name, start, end, symbols, timeFrame, options) {
    var body = {
        "name": name,
        "start": start,
        "end": end,
        "symbols": symbols,
        "timeFrame": timeFrame,
        "options": options,

    };

    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function getPrerequisitesByFilter(optionsIds, symbol, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergence/getFiltered?`;

    if (optionsIds)
        url = `${url}optionsIds=${optionsIds}&`;
    if (symbol)
        url = `${url}symbols=${symbol}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}


async function getBySimulationId(simulationId) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceOptions/getBySimulationId?simulationId=${simulationId}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        })
}

async function getDivergenceAnalyzes(divergenceId) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/getByDivergenceId?divergenceId=${divergenceId}`;

    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return { 'isSuccess': true, 'result': response.data, 'total': response.total };
            }
            return { 'isSuccess': false, 'result': response.errors || [response.message], 'total': response.total };
        }
    });;
}

async function createDivergenceAnalyze(data) {
    var body = {
        "divergenceId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function updateDivergenceAnalyze(data) {
    var body = {
        "divergenceId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };

    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deleteDivergenceAnalyze(divergenceId) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/delete?divergenceId=${divergenceId}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function confirmDivergenceAnalyze(divergenceId) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/confirmDivergence?divergenceId=${divergenceId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function rejectDivergenceAnalyze(divergenceId) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceAnalyze/reject?divergenceId=${divergenceId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function initialize(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/initialize?`;

    if (id)
        url = `${url}id=${id}&`;
   
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}
async function stopSimulation(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/stopSimulation?id=${id}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}
async function progress(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/progress?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0" && response.data) {
                return response.data;
            }
            return 0;
        });
}
async function isActive(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/isActive?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [response.message];
        });
}

async function resetProgress(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/resetProgress?id=${id}`;
    return serviceBase.post(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [response.message];
        });
}

async function getById(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/getById?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function updateSimulation(id,name, start, end, symbols, timeFrame, options) {
    var body = {
        "id":id,
        "name": name,
        "start": start,
        "end": end,
        "symbols": symbols,
        "timeFrame": timeFrame,
        "options": options,
    };

    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function deleteSimulation(id) {
    var url = `${process.env.REACT_APP_SIMULATION_URL}/divergenceSimulation/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
        if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}