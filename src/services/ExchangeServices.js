import { arrayHelper } from '../utils/ArrayHelper'
import { serviceBase } from './ServiceBase';
export const exchangeServices = {
    getChartDataByPosition,
    getChartDataByDivergence,
    getChartData,
    getSymbols
}


async function getSymbols() {
    var url = `${process.env.REACT_APP_EXCHANGE_URL}/symbol/getAll`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.name, label: s.name }));
            }
            return [];
        })
}

async function getChartDataByDivergence(divergences) {
    let result = [];
    if (divergences && divergences.length > 0) {
        let groupedDivergences = arrayHelper.groupBy(divergences, 'symbol');
        for (let symbol in groupedDivergences) {
            let groupedIntervaledDivergences = arrayHelper.groupBy(groupedDivergences[symbol], 'timeFrame');
            for (const interval in groupedIntervaledDivergences) {
                let divArray = groupedIntervaledDivergences[interval].sort(function (a, b) {
                    return b.id - a.id;
                });;

                divArray = divArray.map(div => (
                    {
                        ...div,
                        isHidden: true,
                        divergenceStartDate: div.oldPriceDate / 1000,
                        divergenceEndDate: div.livePriceDate / 1000,
                        chartViewStart: (div.oldPriceDate - div.timeFrameNumber * 60000 * 30),
                        chartViewEnd: (Math.max(...[
                            div.livePriceDate + div.timeFrameNumber * 60000 * 30
                        ].filter(o => o && !Number.isNaN(o))))
                    }));
                const chartStart = Math.min(...divArray.map(o => o.chartViewStart));
                const start = Math.min(...divArray.map(o => o.chartViewStart - o.timeFrameNumber * 60000 * 170));
                const end = Math.max(...divArray.map(o => o.chartViewEnd).filter(o => o && !Number.isNaN(o)));

                let data = await getPerpetualLData(symbol, interval, start, end);
                const visualSymbol = `${symbol}PERP`;

                let divergences = [];
                for (let i = 0; i < divArray.length; i++) {
                    let div = divArray[i];
                    div.macdStartDate = div.oldMacdDate;
                    div.macdEndDate = div.liveMacdDate;
                    div.divStartNode = data?.candleData?.find(d => d.x === div.divergenceStartDate * 1000);
                    div.divEndNode = data?.candleData?.find(d => d.x === div.divergenceEndDate * 1000);
                    div.macdStartNode = data?.histogramMacdData?.find(d => d.x === div.macdStartDate);
                    div.macdEndNode = data?.histogramMacdData?.find(d => d.x === div.macdEndDate);
                    divergences.push(div);
                }
                result.push({
                    start,
                    chartStart,
                    chartEnd: end,
                    end,
                    symbol: symbol,
                    interval,
                    positions: divergences,
                    id: `${visualSymbol}_${interval}`,
                    name: `${visualSymbol} ${interval}`,
                    data
                });
            }
        }
        return result;
    }
    return result;
}

async function getChartDataByPosition(positions) {
    let result = [];
    if (positions && positions.length > 0) {
        let groupedPostions = arrayHelper.groupBy(positions, 'symbol');
        for (let symbol in groupedPostions) {
            let groupedIntervaledPositions = arrayHelper.groupBy(groupedPostions[symbol], 'timeFrameStr');
            for (const interval in groupedIntervaledPositions) {
                let posArray = groupedIntervaledPositions[interval].sort(function (a, b) {
                    return b.id - a.id;
                });;

                posArray = posArray.map(pos => (
                    {
                        ...pos,
                        isHidden: true,
                        isPotentialRewardToRiskHidden: true,
                        isMaxRewardToRiskHidden: true,
                        divergenceStartDate: (pos.divergenceStartDate || pos.startDate),
                        divergenceEndDate: (pos.divergenceEndDate || pos.endDate),
                        chartViewStart: ((pos.divergenceStartDate || pos.startDate) - pos.timeFrameNumber * 60 * 30) * 1000,
                        chartViewEnd: (Math.max(...[
                            pos.exitDate + pos.timeFrameNumber * 60 * 30,
                            pos.triggerDate + pos.timeFrameNumber * 60 * 30,
                            pos.refCandleDate + pos.timeFrameNumber * 60 * 30,
                            (pos.divergenceEndDate || pos.endDate) + pos.timeFrameNumber * 60 * 30
                        ].filter(o => o && !Number.isNaN(o)))) * 1000
                    }));
                const chartStart = Math.min(...posArray.map(o => o.chartViewStart));
                const start = Math.min(...posArray.map(o => o.chartViewStart - o.timeFrameNumber * 60 * 170 * 1000));
                const end = Math.max(...posArray.map(o => o.chartViewEnd).filter(o => o && !Number.isNaN(o)));

                let data = await getPerpetualLData(symbol, interval, start, end);
                let visualSymbol = `${symbol}PERP`;

                let positions = [];
                for (let i = 0; i < posArray.length; i++) {
                    let pos = posArray[i];
                    let macdStartDate = 0;
                    let macdEndDate = 0;

                    if (pos.macdStartDate == null || pos.macdStartDate === 0) {
                        if (macdStartDate === 0) {
                            macdStartDate = (pos.prerequisite?.oldMacdDate ?? 0) / 1000;
                        } else if (data?.histogramMacdData == null) {
                            macdStartDate = (pos.divergenceStartDate || pos.startDate);
                        } else {
                            macdStartDate = arrayHelper.findPeak(data?.histogramMacdData, (pos.divergenceStartDate || pos.startDate) * 1000) / 1000;
                        }
                    } else {
                        macdStartDate = pos.macdStartDate;
                    }

                    if (pos.macdEndDate == null || pos.macdEndDate === 0) {
                        if (macdEndDate === 0) {
                            macdEndDate = (pos.prerequisite?.liveMacdDate ?? 0) / 1000;
                        } else if (data?.histogramMacdData == null) {
                            macdEndDate = (pos.divergenceEndDate || pos.endDate);
                        } else {
                            macdEndDate = arrayHelper.findOldPeak(data?.histogramMacdData, (pos.divergenceEndDate || pos.endDate) * 1000) / 1000;
                        }
                    } else {
                        macdEndDate = pos.macdEndDate;
                    }

                    pos.divStartNode = data?.candleData?.find(d => d.x === (pos.divergenceStartDate || pos.startDate) * 1000);
                    pos.divEndNode = data?.candleData?.find(d => d.x === (pos.divergenceEndDate || pos.endDate) * 1000);

                    pos.macdStartNode = data?.histogramMacdData?.find(d => d.x === macdStartDate * 1000);
                    pos.macdEndNode = data?.histogramMacdData?.find(d => d.x === macdEndDate * 1000);
                    positions.push(pos);
                }
                result.push({
                    start,
                    chartStart,
                    chartEnd: end,
                    end,
                    symbol: symbol,
                    interval,
                    positions,
                    id: `${visualSymbol}_${interval}`,
                    name: `${visualSymbol} ${interval}`,
                    data
                });
            }
        }
        return result;
    }
    return result;
}

async function getChartData(symbol, interval, start, end) {
    let result = [];
    start = start * 1000;
    end = end * 1000;
    let data = await getPerpetualLData(symbol, interval, start, end);
    let visualSymbol = `${symbol}PERP`;
    result.push({
        start,
        chartStart: start,
        chartEnd: end,
        end,
        symbol: symbol,
        interval,
        id: `${visualSymbol}_${interval}`,
        name: `${visualSymbol} ${interval}`,
        data
    });
    return result;
}


const getPerpetualLData = async (symbol, interval, startDate, endDate) => {
    var url = `${process.env.REACT_APP_EXCHANGE_URL}/futures/analyzedHistoricalContinuousKlines?pair=${symbol}&interval=${interval}&startTime=${startDate}&endTime=${endDate}`;
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: GET URL', url);
    return fetch(url)
        .then((r) => r.json())
        .then((response) => {
            let candleData = [];
            let normalMacdData = [];
            let histogramMacdData = [];
            if (response && response.data && response.data.candlesticks) {
                response.data.candlesticks.forEach(candle => {
                    candleData.push({
                        x: candle.time,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        sizeRatio: candle.close === 0 ? 0 : (candle.high - candle.low) / candle.close
                    });
                });
            }
            if (response && response.data && response.data.normalMacd) {
                response.data.normalMacd.forEach(macd => {
                    normalMacdData.push({
                        x: macd.time,
                        y: macd.value
                    });
                });
            }
            if (response && response.data && response.data.histogramMacd) {
                response.data.histogramMacd.forEach(macd => {
                    histogramMacdData.push({
                        x: macd.time,
                        y: macd.value
                    });
                });
            }
            return { candleData, normalMacdData, histogramMacdData };
        })
}
