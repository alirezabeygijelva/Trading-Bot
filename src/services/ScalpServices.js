import { async } from 'rxjs';
import { serviceBase } from './ServiceBase';

export const scalpServices = {
    getPosition,
    getFinanceManagement,
    getPositions,
    getSymbols,
    getReasonsToNotEnter,
    getOldPrerequisite,
    getOldPrerequisitesByFilter,
    getHourlyReport,
    getDailyReport,
    getWebsiteVersions,
    getStoppedPositionsReport,
    getLossesAndWinsReport,
    getNotEnteredPositionsReport,
    getShortAndLongPositionsReport,
    getHourlyWinLossReport,
    checkOrCreate,
    getPositionAnalyzes,
    createPositionAnalyze,
    updatePositionAnalyze,
    getPrerequisiteAnalyzes,
    createPrerequisiteAnalyze,
    updatePrerequisiteAnalyze,
    getMissedPrePos,
    confirmPrerequisiteAnalyze,
    confirmPositionAnalyze,
    rejectPrerequisiteAnalyze,
    rejectPositionAnalyze,
    deletePrerequisiteAnalyze,
    deletePositionAnalyze,
    getConsecutiveStoppedPositionsReport,
    getDashboardInfo,
    getSymbolsWithMostWinsAndLosses,
    getDurationOfActivity,
    getRunningSymbols,
    getRunningTimeFrame,
    getOpenPositions,
    getPrerequisites,
    getPrerequisite,
    getPrerequisitesByFilter,
    getActiveHours,
    createNote,
    getNotes,
    deleteNote,
    getEngineConfigsGroupedByTimeFrame,
    getSimEngineConfigsGroupedByTimeFrame,
    getEngineConfigsGroupedByKey,
    getSimEngineConfigsGroupedByKey,
    getWatchList,
    getLossesAndWinsBasedOnHistogramReport,
    deleteMissedPrePos,
    getExchangeInfo,
    getExchangeDetailedHistory,
    exchangeResetHistory,
    getExchangeBalanceChart,
    getDailyExchangeBalanceChart,
    getExchangeSyncReport,
    getExchangeSyncReportPositions,
    getPrerequisitesBeforeEnteringPositionReport,
    getAllConfigKeys,
    updateConfigKeySettings,
    getKeysOfConfigKeys,
    getOrganizedConfigKeys,
    getBacktestInvestmentValue,
    getNumberOfPositionGroupByRewardToRiskReport,
    getWinRatioBasedOnRewardToRiskReport,
    getPureRewardToRiskDailyReport,
    getAllWebsiteVersions,
    updateWebsiteVersion,
    createWebsiteVersion,
    getWebsiteVersion,
    getWebsiteVersionsDropDown,
    deleteWebsiteVersion,
    configKeysBroadcast,
    templateBroadcast,
    simTemplateBroadcast,
    getPotentialStrategiesReport,
    getBotConfigKeyTemplates,
    getSimBotConfigKeyTemplates,
    createBotConfigKeyTemplate,
    createSimBotConfigKeyTemplate,
    updateBotConfigKeyTemplate,
    deleteBotConfigKeyTemplate,
    updateSimBotConfigKeyTemplate,
    deleteSimBotConfigKeyTemplate,
    activeTemplate,
    activeSimTemplate,
    getPotentialStopTrailReport,
    cancelLongProcess,
    getProperElongationReport,
    resetData,
    getProgress,
    getBestPatternSummaryReport,
    getBestPatternWithFixRewardToRiskReport,
    getBestPatternWithDynamicRewardToRiskReport,
    getBestPatternDynamicRewardToRiskAndSymbolReport,
    getBestPatternWithNumberOfCandleReport,
    getRewardToRiskEfficiencyReport,
    getBotEfficiencyMonthlyReport,
    getCandlesSizeRatioAverageReport,
    getBotEfficiencyReport,
    getExchangeCredentials,
    getExchangeCredentialsParams,
    setExchangeCredentials,
    checkExchangeCredentialsValidation,
    setAllowedBalance,
    getExchangeData,
    getStrategies,
    getAllUnarchivedStrategies,
    getAllArchivedStrategies,
    getStrategy,
    getStrategyStats,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    activeStrategy,
    getAllBacktest,
    getBacktestDetails,
    getBacktestStats,
    createBacktest,
    updateBacktest,
    resetBacktest,
    deleteBacktest,
    getStrategiesDropDown,
    startBacktest,
    stopBacktest,
    getBacktestsDropDown,
    getLatestStrategy,
    startLiveBot,
    stopLiveBot,
    startLiveBotStrategy,
    stopLiveBotStrategy,
    uploadStrategy,
    unarchiveStrategy,
    archiveStrategy,
    getAllUnarchivedBacktests,
    getAllArchivedBacktests,
    archiveBacktest,
    unarchiveBacktest,
    getStrategyTimeline,
    getSimulationTimeline,
    getBestResultBasedOnDifferencePercentageReport,
    getBestResultBasedOnNumberOfHistogramReport,
    getBestResultBasedOnParametersOfDivergenceReport,
    getBestParametersOfStopReportReport,
    getBestParametersOfPowerReport,
    getStrategyData,
    getBackTestStrategyData
}

async function getPosition(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/position/${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return [
                    response.data
                ];
            }
            return [];
        });
}
async function getStrategyData(ids) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getStrategiesDetails?ids=${ids}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}
async function getBackTestStrategyData(ids) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/BacktestBot/getStrategiesDetails?ids=${ids}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}
async function getFinanceManagement(symbols, timeFrame, packSize, triggerStartDate, triggerEndDate,
    isSucceed, isEnteredPosition, isRegisteredInMarket, strategies, backtests, hasHighCommission,
    isOutOfTradeActiveHours, isExchangeData, hasDoubleDivergences, refCandlePattern,
    hasProperElongation, hasProperOverlap, pattern3Value, includePositionsRecords, refCandleBodyRatio,
    refCandleShadowsDifference, isPinBar, reasonsToNotEnter, lowerTimeFrameDivergenceIn, groupBySymbols, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/financeManagement/get?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (timeFrame)
        url = `${url}timeFrame=${timeFrame}&`;
    if (packSize)
        url = `${url}packSize=${packSize}&`;
    if (triggerStartDate)
        url = `${url}triggerStartDate=${triggerStartDate}&`;
    if (triggerEndDate)
        url = `${url}triggerEndDate=${triggerEndDate}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (isEnteredPosition)
        url = `${url}isEnteredPosition=${isEnteredPosition}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (hasHighCommission)
        url = `${url}hasHighCommission=${hasHighCommission}&`;
    if (isOutOfTradeActiveHours)
        url = `${url}isOutOfTradeActiveHours=${isOutOfTradeActiveHours}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (hasDoubleDivergences)
        url = `${url}hasDoubleDivergences=${hasDoubleDivergences}&`;
    if (refCandlePattern)
        url = `${url}refCandlePattern=${refCandlePattern}&`;
    if (hasProperElongation)
        url = `${url}hasProperElongation=${hasProperElongation}&`;
    if (hasProperOverlap)
        url = `${url}hasProperOverlap=${hasProperOverlap}&`;
    if (pattern3Value)
        url = `${url}pattern3Value=${pattern3Value}&`;
    if (includePositionsRecords)
        url = `${url}includePositions=${includePositionsRecords}&`;
    if (groupBySymbols)
        url = `${url}groupBySymbols=${groupBySymbols}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
            //return response;
        });
}

async function getPositions(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, isConfirmed, isReviewed, isOpened, isSucceed, reasonsToNotEnter) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/position/filter?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isConfirmed)
        url = `${url}isConfirmed=${isConfirmed}&`;
    if (isReviewed)
        url = `${url}isReviewed=${isReviewed}&`;
    if (isOpened)
        url = `${url}isOpened=${isOpened}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getSymbols() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/symbol/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.name, label: s.name }));
            }
            return [];
        })
}

async function getReasonsToNotEnter() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/reasonToNotEnter/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.name, label: s.name }));
            }
            return [];
        })
}

async function getOldPrerequisite(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/divergence/${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return [
                    response.data
                ];
            }
            return [];
        });
}

async function getOldPrerequisitesByFilter(symbol, interval, startDate, endDate, isConfirmed) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/divergence/filter?`;

    if (symbol)
        url = `${url}symbol=${symbol}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isConfirmed)
        url = `${url}isConfirmed=${isConfirmed}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getMissedPrePos(symbol, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/missedPrePos/filter?`;
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

async function getHourlyReport(userId, from, to, interval) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/userActivityLog/getHourlyReport?`;

    if (userId)
        url = `${url}userId=${userId}&`;
    if (from)
        url = `${url}from=${from}&`;
    if (to)
        url = `${url}to=${to}&`;
    if (interval)
        url = `${url}interval=${interval}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function getDailyReport(userId, from, to, interval) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/userActivityLog/getDailyReport?`;

    if (userId)
        url = `${url}userId=${userId}&`;
    if (from)
        url = `${url}from=${from}&`;
    if (to)
        url = `${url}to=${to}&`;
    if (interval)
        url = `${url}interval=${interval}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function getWebsiteVersions() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getStoppedPositionsReport(strategies, backtests, symbols, interval, startDate, endDate
    , isRegisteredInMarket, isExchangeData, reasonsToNotEnter) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getStoppedPositionsReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function getLossesAndWinsReport(strategies, backtests
    , symbols, interval, startDate, endDate
    , isRegisteredInMarket, isExchangeData, reasonsToNotEnter) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getLossesAndWinsReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;

    return serviceBase.get(url)
        .then((response) => {

            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function getNotEnteredPositionsReport(strategies, backtests, symbols, interval, startDate, endDate, reasonsToNotEnter
    , rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getNotEnteredPositionsReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function getShortAndLongPositionsReport(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, isExchangeData, reasonsToNotEnter, rewardToRiskTolerance , potentialRewardToRisk) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getShortAndLongPositionsReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (potentialRewardToRisk)
        url = `${url}potentialRewardToRisk=${potentialRewardToRisk}&`;

    return serviceBase.get(url)
        .then((response) => {
            return response;
        });
}

async function getHourlyWinLossReport(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, reasonsToNotEnter, winRatio, pureRewardToRiskSum, pureRewardToRisk, isExchangeData,
    rewardToRiskTolerance, timeDivision, isTehranTimeZone) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getHourlyWinLossReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (winRatio)
        url = `${url}minWinRatio=${winRatio}&`;
    if (pureRewardToRiskSum)
        url = `${url}minPureRewardToRiskSum=${pureRewardToRiskSum}&`;
    if (pureRewardToRisk)
        url = `${url}minPureRewardToRisk=${pureRewardToRisk}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (timeDivision)
        url = `${url}timeDivision=${timeDivision}&`;
    if (isTehranTimeZone)
        url = `${url}isTehranTimeZone=${isTehranTimeZone}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function checkOrCreate(missedPrePos) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/MissedPrePos/checkOrCreate?`;
    return await serviceBase.post(url, missedPrePos).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });;

}

async function createPositionAnalyze(data) {
    var body = {
        "positionId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function updatePositionAnalyze(data) {
    var body = {
        "positionId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function createPrerequisiteAnalyze(data) {
    var body = {
        "prerequisiteId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };
    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function updatePrerequisiteAnalyze(data) {
    var body = {
        "prerequisiteId": data.prePosId,
        "userId": data.userId,
        "isConfirmed": data.isConfirmed,
        "comment": data.comment
    };

    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getPositionAnalyzes(positionId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/getByPositionId?positionId=${positionId}`;

    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return { 'isSuccess': true, 'result': response.data, 'total': response.total };
            }
            return { 'isSuccess': false, 'result': response.errors || [response.message], 'total': response.total };
        }
    });;
}

async function getPrerequisiteAnalyzes(prerequisiteId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/getByPrerequisiteId?prerequisiteId=${prerequisiteId}`;

    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return { 'isSuccess': true, 'result': response.data, 'total': response.total };
            }
            return { 'isSuccess': false, 'result': response.errors || [response.message], 'total': response.total };
        }
    });;
}

async function confirmPositionAnalyze(positionId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/confirm?positionId=${positionId}`;

    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function confirmPrerequisiteAnalyze(prerequisiteId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/confirmDivergence?prerequisiteId=${prerequisiteId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function rejectPositionAnalyze(positionId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/reject?positionId=${positionId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function rejectPrerequisiteAnalyze(prerequisiteId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/rejectDivergence?prerequisiteId=${prerequisiteId}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deletePositionAnalyze(positionId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PositionAnalyze/delete?positionId=${positionId}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deletePrerequisiteAnalyze(prerequisiteId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/PrerequisiteAnalyze/delete?prerequisiteId=${prerequisiteId}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getConsecutiveStoppedPositionsReport(symbols, timeFrame, packSize, maxNumberOfSequences, minNumberOfSequences, triggerStartDate, triggerEndDate,
    isEnteredPosition, isRegisteredInMarket, isExchangeData, strategies, backtests, reasonsToNotEnter, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getConsecutiveStoppedPositionsReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (timeFrame)
        url = `${url}timeFrame=${timeFrame}&`;
    if (packSize)
        url = `${url}packSize=${packSize}&`;
    if (triggerStartDate)
        url = `${url}triggerStartDate=${triggerStartDate}&`;
    if (triggerEndDate)
        url = `${url}triggerEndDate=${triggerEndDate}&`;
    if (isEnteredPosition)
        url = `${url}isEnteredPosition=${isEnteredPosition}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (maxNumberOfSequences)
        url = `${url}maxNumberOfSequences=${maxNumberOfSequences}&`;
    if (minNumberOfSequences)
        url = `${url}minNumberOfSequences=${minNumberOfSequences}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
        });
}

async function getDashboardInfo() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getDashboardInfo`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.data) {
                return response.data;
            }
            return {};
        }
    });
}

async function getSymbolsWithMostWinsAndLosses() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getSymbolsWithMostWinsAndLosses`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getDurationOfActivity() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getDurationOfActivity`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getRunningTimeFrame() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getRunningTimeFrame`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return null;
        }
    });
}

async function getRunningSymbols() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getRunningSymbols`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return null;
        }
    });
}


async function getOpenPositions() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Dashboard/getOpenPositions`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return false;
        }
    });
}

async function getPrerequisites(strategies, backtests, symbols, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/prerequisite/filter?`;

    // if (optionsIds)
    //     url = `${url}optionsIds=${optionsIds}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
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

async function getPrerequisite(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/prerequisite/${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return [response.data];
            }
            return [];
        });
}

async function getPrerequisitesByFilter(symbol, interval, startDate, endDate) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/prerequisite/filter?`;
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

async function getActiveHours() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/dashboard/activeHours`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return "";
        });
}

async function createNote(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/note/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getNotes(selectedServerUserName, start, end) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/note/get?`;
    if (selectedServerUserName)
        url = `${url}user=${selectedServerUserName.replace(' ', '%')}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;

    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deleteNote(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/note/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function getEngineConfigsGroupedByTimeFrame() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/BotConfig/getAllGroupedByTimeFrame`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getSimEngineConfigsGroupedByTimeFrame() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfig/getAllGroupedByTimeFrame`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getEngineConfigsGroupedByKey() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/BotConfig/getAllGroupedByKey`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getSimEngineConfigsGroupedByKey() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfig/getAllGroupedByKey`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getExchangeBalanceChart(symbols, from, to) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getBalanceChart?`;
    var accountUrl = `${process.env.REACT_APP_ENGINE_URL}/Exchange/current`;

    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (from)
        url = `${url}from=${from}&`;
    if (to)
        url = `${url}to=${to}&`;

    return serviceBase.get(accountUrl)
        .then((accountResponse) => {
            if (accountResponse?.data) {
                return serviceBase.get(url)
                    .then((response) => {
                        if (response?.data) {
                            return {
                                name: accountResponse.data.name,
                                color: accountResponse.data.themeColor,
                                data: response.data
                            };
                        }
                        return {};
                    });
            } else {
                return accountResponse.message;
            }
        });
}

async function getDailyExchangeBalanceChart(symbols, from, to) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getDailyBalanceChart?`;
    var accountUrl = `${process.env.REACT_APP_ENGINE_URL}/Exchange/current`;

    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (from)
        url = `${url}from=${from}&`;
    if (to)
        url = `${url}to=${to}&`;

    return serviceBase.get(accountUrl)
        .then((accountResponse) => {
            if (accountResponse?.data) {
                return serviceBase.get(url)
                    .then((response) => {
                        if (response?.data) {
                            return {
                                name: accountResponse.data.name,
                                color: accountResponse.data.themeColor,
                                data: response.data
                            };
                        }
                        return {};
                    });
            } else {
                return accountResponse.message;
            }
        });
}

async function getExchangeSyncReport(strategies, backtests, symbols, from, to) {
    let url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getSyncReport?`;
    let queryString = "";
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        queryString = `${queryString}symbols=${symbols}&`;
    if (from)
        queryString = `${queryString}from=${from}&`;
    if (to)
        queryString = `${queryString}to=${to}&`;

    return serviceBase.get(`${url}${queryString}`)
        .then((response) => {
            if (response?.data) {
                return {
                    data: response.data,
                    requestQueryString: queryString
                };
            }
            return {
                data: [],
                requestQueryString: queryString
            };
        });
}

async function getExchangeSyncReportPositions(requestQueryString, typeToGet) {
    let url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getSyncReportPositions?`;
    if (requestQueryString)
        url = `${url}${requestQueryString}`;

    if (typeToGet)
        url = `${url}typeToGet=${typeToGet}&`;

    return serviceBase.get(`${url}`)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getExchangeInfo() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getAccountInfo`;
    return serviceBase.get(url)
        .then((response) => {
            return response;
        });
}

async function getExchangeDetailedHistory() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getDetailedHistory`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function exchangeResetHistory() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/resetHistory`;
    return serviceBase.post(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return false;
        });
}

async function getWatchList(strategies, backtests, symbols, interval, startDate, endDate, isRegisteredInMarket, isExchangeData
    , selectedServerTotalCount, selectedServerRewardToRiskPure, selectedServerRewardToRiskSum
    , selectedServerRewardToRiskAvg, selectedServerWinRate, selectedServerCalculatedCommissionSum, reasonsToNotEnter, rewardToRiskTolerance , potentialRewardToRisk) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getWatchList?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (selectedServerTotalCount)
        url = `${url}totalCount=${selectedServerTotalCount}&`;
    if (selectedServerRewardToRiskPure)
        url = `${url}rewardToRiskPure=${selectedServerRewardToRiskPure}&`;
    if (selectedServerRewardToRiskSum)
        url = `${url}rewardToRiskSum=${selectedServerRewardToRiskSum}&`;
    if (selectedServerRewardToRiskAvg)
        url = `${url}rewardToRiskAvg=${selectedServerRewardToRiskAvg}&`;
    if (selectedServerWinRate)
        url = `${url}winRate=${selectedServerWinRate}&`;
    if (selectedServerCalculatedCommissionSum)
        url = `${url}calculatedCommissionSum=${selectedServerCalculatedCommissionSum}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (potentialRewardToRisk)
        url = `${url}potentialRewardToRisk=${potentialRewardToRisk}&`;

    return serviceBase.get(url)
        .then((response) => {
            return response;
        });
}

async function getLossesAndWinsBasedOnHistogramReport(strategies, backtests, symbols, interval, startDate, endDate
    , isRegisteredInMarket, isExchangeData, reasonsToNotEnter, includePositionsRecords, rewardToRiskTolerance
    , minTotalCount, minWinRatio, histogramNumber) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getLossesAndWinsBasedOnHistogramReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositionsRecords)
        url = `${url}includePositions=${includePositionsRecords}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (minTotalCount)
        url = `${url}minTotalCount=${minTotalCount}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (histogramNumber)
        url = `${url}histogramNumber=${histogramNumber}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function deleteMissedPrePos(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/missedPrePos/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function getPrerequisitesBeforeEnteringPositionReport(strategies, backtests, symbols, interval, startDate, endDate
    , isRegisteredInMarket, isExchangeData, reasonsToNotEnter) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getPrerequisitesBeforeEnteringPositionReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getAllConfigKeys() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}
async function getOrganizedConfigKeys() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/getOrganizedConfigKeys`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function updateConfigKeySettings(isDeveloperSettings, isLiveBotSettings, keyValues) {
    var body = {
        "Settings": keyValues
    };
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/updateSettings?isDeveloperSettings=${isDeveloperSettings}&isLiveBotSettings=${isLiveBotSettings}`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return { succeed: response.data, errors: [] };
            }
            return { succeed: false, errors: response.errors || [response.message] };
        }
    });
}

async function getBacktestInvestmentValue() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/getBacktestInvestment`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return 0;
        });
}

async function getNumberOfPositionGroupByRewardToRiskReport(strategies, backtests, symbols, interval
    , startDate, endDate, isRegisteredInMarket, reasonsToNotEnter) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getNumberOfPositionGroupByRewardToRiskReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function getWinRatioBasedOnRewardToRiskReport(strategies, backtests, symbols, interval, startDate, endDate
    , isRegisteredInMarket, reasonsToNotEnter, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getWinRatioBasedOnRewardToRiskReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function getPureRewardToRiskDailyReport(strategies, backtests, symbols, interval, startDate, endDate
    , isExchangeData, reasonsToNotEnter, selectedServerIsRegisteredInMarket, isUserView, rewardToRiskTolerance , potentialRewardToRisk) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getPureRewardToRiskDailyReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (selectedServerIsRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${selectedServerIsRegisteredInMarket}&`;
    if (isUserView)
        url = `${url}IsUserView=${isUserView}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (potentialRewardToRisk)
        url = `${url}potentialRewardToRisk=${potentialRewardToRisk}&`;

    return serviceBase.get(url)
        .then((response) => {

            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response?.message, isSucceed: false };
            }
        });
}

async function getAllWebsiteVersions() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/get`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function createWebsiteVersion(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    });
}

async function getWebsiteVersion(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/getById?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function updateWebsiteVersion(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/update`;
    return await serviceBase.put(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    });
}

async function getWebsiteVersionsDropDown() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        });
}

async function deleteWebsiteVersion(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/WebsiteVersion/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function configKeysBroadcast(domains, overwriteDisplayValues, overwriteDescriptions,
    broadcastValues, overwriteValues, addMissedKeys) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/broadcast?`;
    if (overwriteDisplayValues)
        url = `${url}overwriteDisplayValues=${overwriteDisplayValues}&`;
    if (overwriteDescriptions)
        url = `${url}overwriteDescriptions=${overwriteDescriptions}&`;
    if (broadcastValues)
        url = `${url}broadcastValues=${broadcastValues}&`;
    if (overwriteValues)
        url = `${url}overwriteValues=${overwriteValues}&`;
    if (addMissedKeys)
        url = `${url}addMissedKeys=${addMissedKeys}`;

    return await serviceBase.post(url, { domains: domains }).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function templateBroadcast(templateId, domains) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/broadcast?templateId=${templateId}`;

    return await serviceBase.post(url, { domains: domains }).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function simTemplateBroadcast(templateId, domains) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/broadcast?templateId=${templateId}`;

    return await serviceBase.post(url, { domains: domains }).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getBestPatternSummaryReport(token, strategies, backtests, symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , includePositions, reasonsToNotEnter, lowerTimeFrameDivergenceIn, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestPatternSummaryReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getBestPatternWithFixRewardToRiskReport(token, strategies, backtests, symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , reasonsToNotEnter, lowerTimeFrameDivergenceIn, regressionTolerance, minWinRatio, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestPatternWithFixRewardToRiskReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (regressionTolerance)
        url = `${url}regressionTolerance=${regressionTolerance}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getBestPatternWithDynamicRewardToRiskReport(token, strategies, backtests
    , symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , rewardToRiskRange, rewardToRiskStep
    , reasonsToNotEnter, lowerTimeFrameDivergenceIn, minWinRatio, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestPatternWithDynamicRewardToRiskReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (rewardToRiskRange)
        url = `${url}rewardToRiskRange=${rewardToRiskRange}&`;
    if (rewardToRiskStep)
        url = `${url}rewardToRiskStep=${rewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getBestPatternDynamicRewardToRiskAndSymbolReport(token, strategies, backtests, symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , rewardToRiskRange, rewardToRiskStep
    , reasonsToNotEnter, lowerTimeFrameDivergenceIn, minWinRatio, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestPatternBasedOnSymbolReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (rewardToRiskRange)
        url = `${url}rewardToRiskRange=${rewardToRiskRange}&`;
    if (rewardToRiskStep)
        url = `${url}rewardToRiskStep=${rewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getBestPatternWithNumberOfCandleReport(token, strategies, backtests, symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , rewardToRiskRange, rewardToRiskStep
    , selectedServerNumberOfCandles, reasonsToNotEnter, lowerTimeFrameDivergenceIn, minWinRatio, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestPatternWithNumberOfCandleReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (rewardToRiskRange)
        url = `${url}rewardToRiskRange=${rewardToRiskRange}&`;
    if (rewardToRiskStep)
        url = `${url}rewardToRiskStep=${rewardToRiskStep}&`;
    if (selectedServerNumberOfCandles)
        url = `${url}numberOfCandle=${selectedServerNumberOfCandles}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getRewardToRiskEfficiencyReport(token, strategies, backtests, symbols, interval, start, end,
    isRegisteredInMarket, refCandleBodyRatio, refCandleShadowsDifference, rewardToRisk, isPinBar, isSucceed
    , rewardToRiskRange, rewardToRiskStep
    , reasonsToNotEnter, lowerTimeFrameDivergenceIn, minWinRatio, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getRewardToRiskEfficiencyReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (rewardToRisk)
        url = `${url}potentialRewardToRisk=${rewardToRisk}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (rewardToRiskRange)
        url = `${url}rewardToRiskRange=${rewardToRiskRange}&`;
    if (rewardToRiskStep)
        url = `${url}rewardToRiskStep=${rewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response) {
                if (response.code && response.code === "0") {
                    return { 'isSuccess': true, 'data': response.data };
                }
                return { 'isSuccess': false, 'message': response.message };
            }
        });
}

async function getPotentialStrategiesReport(strategies, backtests, symbols, interval, start, end, isRegisteredInMarket, reasonsToNotEnter) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getPotentialStrategiesReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });

}

async function getBotConfigKeyTemplates() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/getAll`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                let result = response.data;
                if (result && result.botConfigTemplates)
                    result.botConfigTemplates = result.botConfigTemplates.sort(function (template1, template2) {
                        if (template1.id === result.id)
                            return -1;

                        else if (template1.order < template2.order)
                            return template1 - template2;

                        else
                            return (template1 < template2) ? -1 : (template1 > template2) ? 1 : 0;
                    });
                return result;
            }
            return [];
        });

}

async function getSimBotConfigKeyTemplates() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/getAll`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                let result = response.data;
                if (result && result.botConfigTemplates)
                    result.botConfigTemplates = result.botConfigTemplates.sort(function (template1, template2) {
                        if (template1.id === result.id)
                            return -1;

                        else if (template1.order < template2.order)
                            return template1 - template2;

                        else
                            return (template1 < template2) ? -1 : (template1 > template2) ? 1 : 0;
                    });
                return result;
            }
            return [];
        });

}

async function createBotConfigKeyTemplate(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function createSimBotConfigKeyTemplate(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function updateBotConfigKeyTemplate(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/update`;
    return await serviceBase.put(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function updateSimBotConfigKeyTemplate(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/update`;
    return await serviceBase.put(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deleteBotConfigKeyTemplate(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/delete?id=${id}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function deleteSimBotConfigKeyTemplate(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/delete?id=${id}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getKeysOfConfigKeys() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/configKeys/getAll`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({
                    value: s.key,
                    label: s.key,
                    valuePattern: s.valuePattern ?? '',
                    allowEmptyValue: s.allowEmptyValue,
                    valueAcceptCollection: s.valueAcceptCollection
                }));
            }
            return [];
        });

}


async function activeTemplate(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/botConfigTemplate/activeTemplate?id=${id}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function activeSimTemplate(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/simBotConfigTemplate/activeTemplate?id=${id}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function getPotentialStopTrailReport(token, strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, targetRewardToRisks, targetRewardToRiskStep, stopRewardToRisks, stopRewardToRiskStep, reasonsToNotEnter
    , isPinBar, refCandleBodyRatio, refCandleShadowsDifference) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getPotentialStopTrailReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (targetRewardToRisks)
        url = `${url}targetRewardToRisks=${targetRewardToRisks}&`;
    if (targetRewardToRiskStep)
        url = `${url}targetRewardToRiskStep=${targetRewardToRiskStep}&`;
    if (stopRewardToRisks)
        url = `${url}stopRewardToRisks=${stopRewardToRisks}&`;
    if (stopRewardToRiskStep)
        url = `${url}stopRewardToRiskStep=${stopRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function cancelLongProcess() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/cancelLongProcess`;
    return serviceBase.get(url).then((response) => {
        if (response) {
            return response;
        }
    });

}

async function getProperElongationReport(strategies, backtests, symbols, interval, start, end
    , isRegisteredInMarket, reasonsToNotEnter, rewardToRiskRange, rewardToRiskStep, minPercentageOfPeriod, token, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getProperElongationReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (rewardToRiskRange)
        url = `${url}rewardToRiskRange=${rewardToRiskRange}&`;
    if (rewardToRiskStep)
        url = `${url}rewardToRiskStep=${rewardToRiskStep}&`;
    if (minPercentageOfPeriod)
        url = `${url}minPercentageOfPeriod=${minPercentageOfPeriod}&`;
    if (token)
        url = `${url}token=${token}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function resetData() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/admin/resetData`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function getBotEfficiencyMonthlyReport(symbols, timeFrame, packSize, triggerStartDate, triggerEndDate,
    isSucceed, isEnteredPosition, isRegisteredInMarket, strategies, backtests, hasHighCommission,
    isOutOfTradeActiveHours, isExchangeData, hasDoubleDivergences, refCandlePattern,
    hasProperElongation, hasProperOverlap, pattern3Value, refCandleBodyRatio,
    refCandleShadowsDifference, isPinBar, reasonsToNotEnter, lowerTimeFrameDivergenceIn, groupBySymbols, rewardToRiskTolerance , potentialRewardToRisk) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBotEfficiencyMonthlyReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (timeFrame)
        url = `${url}timeFrame=${timeFrame}&`;
    if (packSize)
        url = `${url}packSize=${packSize}&`;
    if (triggerStartDate)
        url = `${url}triggerStartDate=${triggerStartDate}&`;
    if (triggerEndDate)
        url = `${url}triggerEndDate=${triggerEndDate}&`;
    if (isSucceed)
        url = `${url}isSucceed=${isSucceed}&`;
    if (isEnteredPosition)
        url = `${url}isEnteredPosition=${isEnteredPosition}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (hasHighCommission)
        url = `${url}hasHighCommission=${hasHighCommission}&`;
    if (isOutOfTradeActiveHours)
        url = `${url}isOutOfTradeActiveHours=${isOutOfTradeActiveHours}&`;
    if (isExchangeData)
        url = `${url}isExchangeData=${isExchangeData}&`;
    if (hasDoubleDivergences)
        url = `${url}hasDoubleDivergences=${hasDoubleDivergences}&`;
    if (refCandlePattern)
        url = `${url}refCandlePattern=${refCandlePattern}&`;
    if (hasProperElongation)
        url = `${url}hasProperElongation=${hasProperElongation}&`;
    if (hasProperOverlap)
        url = `${url}hasProperOverlap=${hasProperOverlap}&`;
    if (pattern3Value)
        url = `${url}pattern3Value=${pattern3Value}&`;
    if (groupBySymbols)
        url = `${url}groupBySymbols=${groupBySymbols}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (lowerTimeFrameDivergenceIn)
        url = `${url}lowerTimeFrameDivergenceIn=${lowerTimeFrameDivergenceIn}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;
    if (potentialRewardToRisk)
        url = `${url}potentialRewardToRisk=${potentialRewardToRisk}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
            //return response;
        });
}

async function getCandlesSizeRatioAverageReport(symbol, timeFrame, candleStartDate, candleEndDate) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getCandlesSizeRatioAverageReport?`;

    if (symbol)
        url = `${url}symbol=${symbol}&`;
    if (timeFrame)
        url = `${url}timeFrame=${timeFrame}&`;
    // if (packSize)
    //     url = `${url}packSize=${packSize}&`;
    if (candleStartDate)
        url = `${url}candleStartDate=${candleStartDate}&`;
    if (candleEndDate)
        url = `${url}candleEndDate=${candleEndDate}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {}
            //return response;
        });
}
async function getBotEfficiencyReport(strategies, backtests, interval, start, end, rewardToRiskTolerance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBotEfficiencyReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (start)
        url = `${url}startDate=${start}&`;
    if (end)
        url = `${url}endDate=${end}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });

}

async function getExchangeCredentials() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getExchangeCredentials`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function getExchangeCredentialsParams() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/getExchangeCredentialsParams`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return null;
        });
}

async function setExchangeCredentials(apiKey, secretKey, passPhrase) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/setExchangeCredentials`;
    var body = {
        apiKey,
        secretKey,
        passPhrase
    }
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            return response;
        }
    });
}

async function checkExchangeCredentialsValidation() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/checkExchangeCredentialsValidation`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            return response;
        }
    });
}

async function setAllowedBalance(balance) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/setAllowedBalance?balance=${balance}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            return response;
        }
    });
}


async function getExchangeData() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Exchange/current`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function getStrategy(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getById?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return null;
        });
}

async function getStrategyStats(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getStats?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}
async function getStrategies() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return null;
        });
}

async function getAllArchivedStrategies() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getAllArchivedStrategies`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return null;
        });
}

async function getAllUnarchivedStrategies() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getAllUnarchivedStrategies`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return null;
        });
}

async function uploadStrategy(id, name) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/sendToCoreServer?id=${id}&name=${name}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}

async function archiveStrategy(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/archive?id=${id}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}
async function unarchiveStrategy(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/unarchive?id=${id}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}

async function createStrategy(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}

async function updateStrategy(data) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/update`;
    return await serviceBase.put(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}

async function deleteStrategy(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/delete?id=${id}`;
    return await serviceBase.del(url).then((response) => {
        if (response) {
            return response;
        }
    });
}

async function activeStrategy(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/activeStrategy?id=${id}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            return response;
        }
    });
}

async function getAllBacktest() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getall`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return []
        });
}

async function getAllArchivedBacktests() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getAllArchivedBacktests`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [response.message]
        });
}
async function getAllUnarchivedBacktests() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getAllUnarchivedBacktests`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [response.message]
        });
}

async function archiveBacktest(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/archive?id=${id}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}
async function unarchiveBacktest(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/unarchive?id=${id}`;
    return await serviceBase.put(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return [response.message];
        }
    });
}

async function getBacktestDetails(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getDetails?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function getBacktestStats(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getStats?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function updateBacktest(id, name, start, end, isRunning, isLocked, balance, strategyId) {
    var body = {
        "id": id,
        "name": name,
        "startDate": start,
        "endDate": end,
        "isRunning": isRunning,
        "isLocked": isLocked,
        "balance": balance,
        "strategyId": strategyId
    };

    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/update`;
    return await serviceBase.put(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function resetBacktest(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/reset?id=${id}`;
    return serviceBase.put(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function deleteBacktest(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/delete?id=${id}`;
    return serviceBase.del(url)
        .then((response) => {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        });
}

async function createBacktest(name, start, end, balance, strategyId) {
    var body = {
        "name": name,
        "startDate": start,
        "endDate": end,
        "balance": balance,
        "strategyId": strategyId
    };

    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/create`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });

}

async function getStrategiesDropDown() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/strategy/getAllNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.code === "0" && response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        })
}

async function startBacktest(simulationId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/start?backtestId=${simulationId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function stopBacktest(simulationId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/stop?backtestId=${simulationId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}



async function getBacktestsDropDown() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/BacktestBot/getAllNames`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response?.code === "0") {
                return response.data.map(s => ({ value: s.id, label: s.name }));
            }
            return [];
        });
}

async function getLatestStrategy() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/Strategy/getLatestStrategy`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return {};
        });
}

async function startLiveBot() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/LiveBot/start`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function stopLiveBot() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/LiveBot/stop`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function startLiveBotStrategy(strategyId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/LiveBot/strategyStart?strategyId=${strategyId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function stopLiveBotStrategy(strategyId) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/LiveBot/strategyStop?strategyId=${strategyId}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}


async function getStrategyTimeline(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/strategy/getTimeline?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getSimulationTimeline(id) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/backtestBot/getTimeline?id=${id}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function getBestResultBasedOnDifferencePercentageReport(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, dynamicRewardToRiskRange, dynamicRewardToRiskStep, reasonsToNotEnter
    , minWinRatio, includePositions, differencePercentageType, groupBySymbol
    , refCandleBodyRatio, refCandleShadowsDifference, isPinBar, token, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestResultBasedOnDifferencePercentageReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (dynamicRewardToRiskRange)
        url = `${url}dynamicRewardToRiskRange=${dynamicRewardToRiskRange}&`;
    if (dynamicRewardToRiskStep)
        url = `${url}dynamicRewardToRiskStep=${dynamicRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (differencePercentageType)
        url = `${url}differencePercentageType=${differencePercentageType}&`;
    if (groupBySymbol)
        url = `${url}groupBySymbol=${groupBySymbol}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (token)
        url = `${url}token=${token}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function getBestResultBasedOnNumberOfHistogramReport(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, dynamicRewardToRiskRange, dynamicRewardToRiskStep, reasonsToNotEnter
    , minWinRatio, includePositions, numberOfHistogramType, groupBySymbol
    , refCandleBodyRatio, refCandleShadowsDifference, isPinBar, token, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestResultBasedOnNumberOfHistogramReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (dynamicRewardToRiskRange)
        url = `${url}dynamicRewardToRiskRange=${dynamicRewardToRiskRange}&`;
    if (dynamicRewardToRiskStep)
        url = `${url}dynamicRewardToRiskStep=${dynamicRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (numberOfHistogramType)
        url = `${url}numberOfHistogramType=${numberOfHistogramType}&`;
    if (groupBySymbol)
        url = `${url}groupBySymbol=${groupBySymbol}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (token)
        url = `${url}token=${token}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function getBestResultBasedOnParametersOfDivergenceReport(strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, dynamicRewardToRiskRange, dynamicRewardToRiskStep, reasonsToNotEnter
    , minWinRatio, includePositions, differencePercentageType, numberOfHistogramType, groupBySymbol
    , refCandleBodyRatio, refCandleShadowsDifference, isPinBar, token, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestResultBasedOnParametersOfDivergenceReport?`;

    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (dynamicRewardToRiskRange)
        url = `${url}dynamicRewardToRiskRange=${dynamicRewardToRiskRange}&`;
    if (dynamicRewardToRiskStep)
        url = `${url}dynamicRewardToRiskStep=${dynamicRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (differencePercentageType)
        url = `${url}differencePercentageType=${differencePercentageType}&`;
    if (numberOfHistogramType)
        url = `${url}numberOfHistogramType=${numberOfHistogramType}&`;
    if (groupBySymbol)
        url = `${url}groupBySymbol=${groupBySymbol}&`;
    if (refCandleBodyRatio)
        url = `${url}refCandleBodyRatio=${refCandleBodyRatio}&`;
    if (refCandleShadowsDifference)
        url = `${url}refCandleShadowsDifference=${refCandleShadowsDifference}&`;
    if (isPinBar)
        url = `${url}isPinBar=${isPinBar}&`;
    if (token)
        url = `${url}token=${token}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function getBestParametersOfStopReportReport(token, strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, dynamicRewardToRiskRange, dynamicRewardToRiskStep, reasonsToNotEnter
    , minWinRatio, includePositions, maxNumberOfCandle, maxStopLossTolerance, stopLossToleranceStep, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestParametersOfStopReportReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (dynamicRewardToRiskRange)
        url = `${url}dynamicRewardToRiskRange=${dynamicRewardToRiskRange}&`;
    if (dynamicRewardToRiskStep)
        url = `${url}dynamicRewardToRiskStep=${dynamicRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (maxNumberOfCandle)
        url = `${url}maxNumberOfCandle=${maxNumberOfCandle}&`;
    if (maxStopLossTolerance)
        url = `${url}maxTolerance=${maxStopLossTolerance}&`;
    if (stopLossToleranceStep)
        url = `${url}toleranceStep=${stopLossToleranceStep}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function getBestParametersOfPowerReport(token, strategies, backtests, symbols, interval, startDate, endDate,
    isRegisteredInMarket, dynamicRewardToRiskRange, dynamicRewardToRiskStep, reasonsToNotEnter
    , minWinRatio, includePositions, overlapCandlesCount, overlapPercentage, usingShadow, groupedBySymbol, rewardToRiskTolerance) {

    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getBestParametersOfPowerReport?`;

    if (token)
        url = `${url}token=${token}&`;
    if (strategies)
        url = `${url}strategies=${strategies}&`;
    if (backtests)
        url = `${url}backtests=${backtests}&`;
    if (symbols)
        url = `${url}symbols=${symbols}&`;
    if (interval)
        url = `${url}timeFrame=${interval}&`;
    if (startDate)
        url = `${url}startDate=${startDate}&`;
    if (endDate)
        url = `${url}endDate=${endDate}&`;
    if (isRegisteredInMarket)
        url = `${url}isRegisteredInMarket=${isRegisteredInMarket}&`;
    if (dynamicRewardToRiskRange)
        url = `${url}dynamicRewardToRiskRange=${dynamicRewardToRiskRange}&`;
    if (dynamicRewardToRiskStep)
        url = `${url}dynamicRewardToRiskStep=${dynamicRewardToRiskStep}&`;
    if (reasonsToNotEnter)
        url = `${url}reasonsToNotEnter=${reasonsToNotEnter}&`;
    if (includePositions)
        url = `${url}includePositions=${includePositions}&`;
    if (minWinRatio)
        url = `${url}minWinRatio=${minWinRatio}&`;
    if (overlapCandlesCount)
        url = `${url}numberOfCandleRange=${overlapCandlesCount}&`;
    if (overlapPercentage)
        url = `${url}minOverlappingPercentage=${overlapPercentage}&`;
    if (usingShadow === false)
        url = `${url}usingShadow=${usingShadow}&`;
    if (groupedBySymbol)
        url = `${url}groupedBySymbol=${groupedBySymbol}&`;
    if (rewardToRiskTolerance)
        url = `${url}rewardToRiskTolerance=${rewardToRiskTolerance}&`;

    return serviceBase.get(url)
        .then((response) => {
            if (response?.data && response.code === "0") {
                return { data: response.data, isSucceed: true };
            }
            else {
                return { message: response.message, isSucceed: false };
            }
        });
}

async function getProgress(token) {
    var url = `${process.env.REACT_APP_ENGINE_URL}/statisticalReport/getProgress?token=${token}`;
    return serviceBase.get(url)
        .then((response) => {
            if (response.code && response.code === "0" && response.data) {
                return { 'isSuccess': true, 'data': response.data }
            }
            return { 'isSuccess': false, 'message': response.message }
        });
}