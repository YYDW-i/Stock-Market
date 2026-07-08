window.GMarket = window.GMarket || {};

window.GMarket.Portfolio = (function () {
  var Utils = window.GMarket.Utils;
  var FEE_RATE = 0.001;

  function createPortfolio(initialCash) {
    return {
      initialCash: initialCash,
      cash: initialCash,
      positions: {},
      trades: [],
      equityHistory: [initialCash]
    };
  }

  function getPosition(portfolio, symbol) {
    return portfolio.positions[symbol] || {
      symbol: symbol,
      quantity: 0,
      avgCost: 0
    };
  }

  function buy(portfolio, symbol, quantity, price, day, timeLabel) {
    quantity = Math.floor(Number(quantity));
    if (!quantity || quantity <= 0) {
      return fail("交易数量必须是正整数。");
    }

    var gross = quantity * price;
    var fee = gross * FEE_RATE;
    var totalCost = gross + fee;

    if (portfolio.cash < totalCost) {
      return fail("现金不足。本次买入需要 " + Utils.formatMoney(totalCost) + "。");
    }

    var position = getPosition(portfolio, symbol);
    var oldMarketValue = position.quantity * position.avgCost;
    var newQuantity = position.quantity + quantity;
    var newAvgCost = (oldMarketValue + gross + fee) / newQuantity;

    portfolio.positions[symbol] = {
      symbol: symbol,
      quantity: newQuantity,
      avgCost: Utils.round(newAvgCost, 4)
    };
    portfolio.cash -= totalCost;

    recordTrade(portfolio, {
      day: day,
      timeLabel: timeLabel,
      side: "buy",
      symbol: symbol,
      quantity: quantity,
      price: price,
      fee: fee,
      amount: totalCost
    });

    return ok("买入成功：" + symbol + " × " + quantity + "，成交价 " + Utils.formatMoney(price) + "。");
  }

  function sell(portfolio, symbol, quantity, price, day, timeLabel) {
    quantity = Math.floor(Number(quantity));
    if (!quantity || quantity <= 0) {
      return fail("交易数量必须是正整数。");
    }

    var position = getPosition(portfolio, symbol);
    if (position.quantity < quantity) {
      return fail("持仓不足。当前可卖数量为 " + position.quantity + "。");
    }

    var gross = quantity * price;
    var fee = gross * FEE_RATE;
    var proceeds = gross - fee;

    position.quantity -= quantity;
    portfolio.cash += proceeds;

    if (position.quantity <= 0) {
      delete portfolio.positions[symbol];
    } else {
      portfolio.positions[symbol] = position;
    }

    recordTrade(portfolio, {
      day: day,
      timeLabel: timeLabel,
      side: "sell",
      symbol: symbol,
      quantity: quantity,
      price: price,
      fee: fee,
      amount: proceeds
    });

    return ok("卖出成功：" + symbol + " × " + quantity + "，成交价 " + Utils.formatMoney(price) + "。");
  }

  function recordTrade(portfolio, trade) {
    portfolio.trades.unshift({
      id: Date.now() + "-" + Math.random().toString(16).slice(2),
      day: trade.day,
      timeLabel: trade.timeLabel || ("第 " + trade.day + " 天"),
      side: trade.side,
      symbol: trade.symbol,
      quantity: trade.quantity,
      price: trade.price,
      fee: Utils.round(trade.fee, 2),
      amount: Utils.round(trade.amount, 2)
    });
  }

  function placeOrder(portfolio, side, symbol, quantity, price, day, timeLabel) {
    if (side === "buy") return buy(portfolio, symbol, quantity, price, day, timeLabel);
    if (side === "sell") return sell(portfolio, symbol, quantity, price, day, timeLabel);
    return fail("未知交易方向。");
  }

  function marketValue(portfolio, market) {
    return Object.keys(portfolio.positions).reduce(function (acc, symbol) {
      var position = portfolio.positions[symbol];
      var price = window.GMarket.MarketEngine.getPrice(market, symbol);
      return acc + position.quantity * price;
    }, 0);
  }

  function totalEquity(portfolio, market) {
    return portfolio.cash + marketValue(portfolio, market);
  }

  function snapshotEquity(portfolio, market) {
    portfolio.equityHistory.push(Utils.round(totalEquity(portfolio, market), 2));
  }

  function listPositions(portfolio, market) {
    return Object.keys(portfolio.positions).map(function (symbol) {
      var position = portfolio.positions[symbol];
      var price = window.GMarket.MarketEngine.getPrice(market, symbol);
      var value = price * position.quantity;
      var cost = position.avgCost * position.quantity;
      var pnl = value - cost;
      return {
        symbol: symbol,
        quantity: position.quantity,
        avgCost: position.avgCost,
        price: price,
        value: value,
        pnl: pnl,
        pnlRate: cost > 0 ? pnl / cost : 0
      };
    });
  }

  function ok(message) {
    return { success: true, message: message };
  }

  function fail(message) {
    return { success: false, message: message };
  }

  return {
    FEE_RATE: FEE_RATE,
    createPortfolio: createPortfolio,
    placeOrder: placeOrder,
    getPosition: getPosition,
    marketValue: marketValue,
    totalEquity: totalEquity,
    snapshotEquity: snapshotEquity,
    listPositions: listPositions
  };
})();
