window.GMarket = window.GMarket || {};

window.GMarket.Game = (function () {
  var MarketEngine = window.GMarket.MarketEngine;
  var Portfolio = window.GMarket.Portfolio;
  var Storage = window.GMarket.Storage;

  var config = {
    initialCash: 100000,

    // 一个交易日细分成多个时刻
    timeSlots: [
      { label: "09:30", name: "开盘" },
      { label: "10:30", name: "早盘" },
      { label: "11:30", name: "午盘" },
      { label: "13:30", name: "午后" },
      { label: "14:30", name: "尾盘" },
      { label: "15:00", name: "收盘" }
    ]
  };

  var state = null;

  function createNewState() {
    var market = MarketEngine.createMarket(window.GMarket.STOCKS);

    return {
      day: 1,

      // 新增：当前交易日内的第几个时刻
      slotIndex: 0,

      selectedSymbol: window.GMarket.STOCKS[0].symbol,
      chartMode: "stock",
      isAutoRunning: false,
      market: market,
      portfolio: Portfolio.createPortfolio(config.initialCash),
      lastEvents: [],
      lastMessage: "欢迎进入模拟市场。当前为第 1 天 09:30 开盘。先选择股票，再尝试小仓位交易。"
    };
  }

  function getCurrentTimeSlot() {
    var current = getState();
    return config.timeSlots[current.slotIndex] || config.timeSlots[0];
  }

  function getTimeLabel(stateValue) {
    var targetState = stateValue || getState();
    var slot = config.timeSlots[targetState.slotIndex] || config.timeSlots[0];

    return "第 " + targetState.day + " 天 " + slot.label + " " + slot.name;
  }

  function advanceTime(current) {
    current.slotIndex += 1;

    if (current.slotIndex >= config.timeSlots.length) {
      current.slotIndex = 0;
      current.day += 1;
      return {
        isNewDay: true
      };
    }

    return {
      isNewDay: false
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
    var advanceResult = advanceTime(current);
    var timeLabel = getTimeLabel(current);

    current.lastEvents = [];

    if (advanceResult.isNewDay) {
      current.lastEvents = MarketEngine.stepDay(current.market, current.day);
    } else {
      MarketEngine.stepMoment(current.market, current.day, current.slotIndex, config.timeSlots.length);
    }

    Portfolio.snapshotEquity(current.portfolio, current.market);

    if (advanceResult.isNewDay && current.lastEvents.length) {
      current.lastMessage = timeLabel + "，出现市场事件：" + current.lastEvents.map(function (e) {
        return e.title;
      }).join("；");
    } else if (advanceResult.isNewDay) {
      current.lastMessage = timeLabel + "，进入新的交易日。没有重大新闻，但市场继续波动。";
    } else {
      current.lastMessage = timeLabel + "，盘中行情已更新。价格发生小幅波动。";
    }

    save();
    return current;
  }

  function placeOrder(side, quantity) {
    var current = getState();
    var symbol = current.selectedSymbol;
    var price = MarketEngine.getPrice(current.market, symbol);
    var timeLabel = getTimeLabel(current);

    var result = Portfolio.placeOrder(
      current.portfolio,
      side,
      symbol,
      quantity,
      price,
      current.day,
      timeLabel
    );

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

      // 兼容旧存档：旧存档没有 slotIndex，就从 0 开始
      slotIndex: Number(loaded.slotIndex || 0),

      selectedSymbol: loaded.selectedSymbol || fresh.selectedSymbol,
      chartMode: loaded.chartMode || fresh.chartMode,

      // 读取远程存档时，不恢复自动运行状态
      isAutoRunning: false,

      market: loaded.market || fresh.market,
      portfolio: loaded.portfolio || fresh.portfolio,
      lastEvents: loaded.lastEvents || [],
      lastMessage: loaded.lastMessage || "已读取账号存档。当前时间：" + getTimeLabel(loaded)
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
      getCurrentTimeSlot: getCurrentTimeSlot,
      getTimeLabel: getTimeLabel,
      config: config
    };
  })();
