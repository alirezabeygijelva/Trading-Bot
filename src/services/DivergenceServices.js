import { serviceBase } from './ServiceBase';
export const divergenceServices = {
    getDivergence,
    getDivergences,
    getSymbols,
    getEngineNames,
    getOptionsNames,
    createEngine,
    getAllEngine,
    getPrerequisitesByFilter,
    getByEngineId,
    getDivergenceAnalyzes,
    createDivergenceAnalyze,
    updateDivergenceAnalyze,
    deleteDivergenceAnalyze,
    confirmDivergenceAnalyze,
    rejectDivergenceAnalyze,
    startEngine,
    stopEngine,
    progress,
    simulationProgress,
    startSimulation,
    getOnePhase,
    getTwoPhases,
    resetProgress,
    getById,
    updateEngine,
    deleteEngine
}


async function getDivergence(id) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergence/get?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return [response.data];
            }
            return [];
        });
}

async function getDivergences(engineIds, optionsIds, symbols, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergence/getFiltered?`;

    if (engineIds)
        url = `${url}engineIds=${engineIds}&`;
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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/symbol/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.name, label: s.name }));
            }
            return [];
        })
}

async function getEngineNames() {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/getNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        })
}

async function getOptionsNames() {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceOptions/getNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name, fullLabel: s.fullName }));
            }
            return [];
        })
}

async function createEngine(name, symbols, timeFrames, options) {
    var body = {
        "name": name,
        "symbols": symbols,
        "timeFrames": timeFrames,
        "options": options,

    };

    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function getAllEngine() {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/getall`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return []
            //return response;
        });
}

async function getPrerequisitesByFilter(optionsIds, symbol, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergence/getFiltered?`;

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

async function getByEngineId(engineId) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceOptions/getByEngineId?engineId=${engineId}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        })
}

async function getDivergenceAnalyzes(divergenceId) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/getByDivergenceId?divergenceId=${divergenceId}`;

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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/create`;
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

    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/update`;
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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/delete?divergenceId=${divergenceId}`;
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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/confirmDivergence?divergenceId=${divergenceId}`;
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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/divergenceAnalyze/reject?divergenceId=${divergenceId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function startEngine(engineId) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/startEngine?engineId=${engineId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}
async function stopEngine() {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/stopEngine`;
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
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/progress?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0" && response.data) {
                return response.data;
            }
            return 0;
        });
}

async function simulationProgress(id) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/simulationProgress?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0" && response.data) {
                return response.data;
            }
            return 0;
        });
}

async function startSimulation(simulationId) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/startSimulation?simulationId=${simulationId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getOnePhase() {

    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/healthCheck/getOnePhase`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getTwoPhases() {

    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/healthCheck/getTwoPhases`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function resetProgress(id) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/resetProgress?id=${id}`;
    return serviceBase.post(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [response.message];
        });
}

async function getById(id) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/getById?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function updateEngine(id,name, symbols, timeFrames, options) {
    var body = {
        "id" : id,
        "name": name,
        "symbols": symbols,
        "timeFrames": timeFrames,
        "options": options,
    };

    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function deleteEngine(id) {
    var url = `${process.env.REACT_APP_DIVERGENCE_URL}/engine/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
        if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}