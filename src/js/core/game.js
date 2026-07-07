window.GMarket = window.GMarket || {};

window.GMarket.Game = (function () {
  var MarketEngine = window.GMarket.MarketEngine;
  var Portfolio = window.GMarket.Portfolio;
  var Storage = window.GMarket.Storage;

  var config = {
    initialCash: 100000,
    maxDay: 60
  };

  var state = null;

  function createNewState() {
    var market = MarketEngine.createMarket(window.GMarket.STOCKS);
    return {
      day: 1,
      selectedSymbol: window.GMarket.STOCKS[0].symbol,
      chartMode: "stock",
      isAutoRunning: false,
      market: market,
      portfolio: Portfolio.createPortfolio(config.initialCash),
      lastEvents: [],
      lastMessage: "欢迎进入模拟市场。先选择股票，再尝试小仓位交易。"
    };
  }

  function init() {
    var saved = Storage.load();
    if (saved && saved.market && saved.portfolio) {
      state = saved;
    } else {
      state = createNewState();
    }
    return state;
  }

  function getState() {
    if (!state) init();
    return state;
  }

  function selectStock(symbol) {
    getState().selectedSymbol = symbol;
    save();
  }

  function setChartMode(mode) {
    getState().chartMode = mode;
    save();
  }

  function nextDay() {
    var current = getState();
    if (current.day >= config.maxDay) {
      current.lastMessage = "本轮模拟已经到达第 " + config.maxDay + " 天。可以重置后重新开始。";
      save();
      return current;
    }

    current.day += 1;
    current.lastEvents = MarketEngine.stepDay(current.market, current.day);
    Portfolio.snapshotEquity(current.portfolio, current.market);

    if (current.lastEvents.length) {
      current.lastMessage = "第 " + current.day + " 天出现市场事件：" + current.lastEvents.map(function (e) { return e.title; }).join("；");
    } else {
      current.lastMessage = "第 " + current.day + " 天行情已更新。没有重大新闻，但价格仍会因趋势和随机波动变化。";
    }

    save();
    return current;
  }

  function placeOrder(side, quantity) {
    var current = getState();
    var symbol = current.selectedSymbol;
    var price = MarketEngine.getPrice(current.market, symbol);
    var result = Portfolio.placeOrder(current.portfolio, side, symbol, quantity, price, current.day);
    current.lastMessage = result.message;
    Portfolio.snapshotEquity(current.portfolio, current.market);
    save();
    return result;
  }

  function toggleAuto() {
    var current = getState();
    current.isAutoRunning = !current.isAutoRunning;
    save();
    return current.isAutoRunning;
  }

  function stopAuto() {
    getState().isAutoRunning = false;
    save();
  }

  function reset() {
    Storage.clear();
    state = createNewState();
    save();
    return state;
  }

  function save() {
    Storage.save(state);
  }

  function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

function isValidLoadedState(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    value.market &&
    value.portfolio &&
    value.market.stocks &&
    value.portfolio.positions
  );
}

function normalizeLoadedState(value) {
  var fresh = createNewState();
  var loaded = cloneState(value);

  return {
    day: Number(loaded.day || fresh.day),
    selectedSymbol: loaded.selectedSymbol || fresh.selectedSymbol,
    chartMode: loaded.chartMode || fresh.chartMode,

    // 读取远程存档时，不建议恢复自动运行状态，避免刚登录就自动跳天
    isAutoRunning: false,

    market: loaded.market || fresh.market,
    portfolio: loaded.portfolio || fresh.portfolio,
    lastEvents: loaded.lastEvents || [],
    lastMessage: loaded.lastMessage || "已读取账号存档。"
  };
}

function getSaveData() {
  var current = getState();

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    state: cloneState(current)
  };
}

function loadSaveData(saveData) {
  if (!saveData) {
    return {
      success: false,
      message: "没有可读取的存档。"
    };
  }

  var loadedState = saveData.state ? saveData.state : saveData;

  if (!isValidLoadedState(loadedState)) {
    return {
      success: false,
      message: "存档格式不正确，无法读取。"
    };
  }

  state = normalizeLoadedState(loadedState);
  save();

  return {
    success: true,
    message: "账号存档读取成功。"
  };
}

  return {
    init: init,
    getState: getState,
    selectStock: selectStock,
    setChartMode: setChartMode,
    nextDay: nextDay,
    placeOrder: placeOrder,
    toggleAuto: toggleAuto,
    stopAuto: stopAuto,
    reset: reset,
    save: save,
    getSaveData: getSaveData,
    loadSaveData: loadSaveData,
    config: config
  };
})();
