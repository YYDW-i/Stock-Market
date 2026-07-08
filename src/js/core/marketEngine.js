window.GMarket = window.GMarket || {};

window.GMarket.MarketEngine = (function () {
  var Utils = window.GMarket.Utils;

  function createMarket(stocks) {
    var map = {};
    stocks.forEach(function (stock) {
      map[stock.symbol] = {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        description: stock.description,
        initialPrice: stock.initialPrice,
        price: stock.initialPrice,
        previousPrice: stock.initialPrice,
        drift: stock.drift,
        volatility: stock.volatility,
        sentiment: 0,
        history: [stock.initialPrice],
        returns: [0],
        volume: randomVolume(stock.initialPrice)
      };
    });

    return {
      stocks: map,
      indexHistory: [1000],
      marketSentiment: 0,
      triggeredEvents: []
    };
  }

  function randomVolume(price) {
    var base = 600000 + Math.random() * 3000000;
    return Math.round(base / Math.max(price / 30, 0.7));
  }

  function getPrice(market, symbol) {
    return market.stocks[symbol] ? market.stocks[symbol].price : 0;
  }

  function getStock(market, symbol) {
    return market.stocks[symbol];
  }

  function listStocks(market) {
    return Object.keys(market.stocks).map(function (symbol) {
      return market.stocks[symbol];
    });
  }

  function findEventsForDay(day) {
    return window.GMarket.MARKET_EVENTS.filter(function (event) {
      return event.day === day;
    });
  }

  function eventApplies(event, stock) {
    if (event.targetType === "market") return true;
    if (event.targetType === "sector") return event.target === stock.sector;
    if (event.targetType === "symbol") return event.target === stock.symbol;
    return false;
  }

  function stepDay(market, day) {
    var events = findEventsForDay(day);
    var indexBefore = market.indexHistory[market.indexHistory.length - 1];
    var relativeChanges = [];

    events.forEach(function (event) {
      market.triggeredEvents.unshift({
        day: day,
        title: event.title,
        description: event.description,
        impact: event.impact,
        targetType: event.targetType,
        target: event.target
      });

      if (event.targetType === "market") {
        market.marketSentiment += event.sentiment;
      }
    });

    listStocks(market).forEach(function (stock) {
      var shock = 0;

      events.forEach(function (event) {
        if (eventApplies(event, stock)) {
          shock += event.impact;
          stock.sentiment += event.sentiment;
        }
      });

      var randomness = Utils.normalRandom() * stock.volatility;
      var momentum = averageRecentReturn(stock, 3) * 0.22;
      var sentimentEffect = (stock.sentiment * 0.012) + (market.marketSentiment * 0.008);
      var rawReturn = stock.drift + randomness + momentum + sentimentEffect + shock;
      var boundedReturn = Utils.clamp(rawReturn, -0.18, 0.18);

      stock.previousPrice = stock.price;
      stock.price = Math.max(1, Utils.round(stock.price * (1 + boundedReturn), 2));
      stock.returns.push(boundedReturn);
      stock.history.push(stock.price);
      stock.volume = Math.max(8000, Math.round(randomVolume(stock.price) * (1 + Math.abs(boundedReturn) * 8)));
      stock.sentiment *= 0.82;

      relativeChanges.push(stock.price / stock.initialPrice);
    });

    market.marketSentiment *= 0.88;

    var avgRelative = Utils.sum(relativeChanges) / relativeChanges.length;
    var newIndex = Utils.round(1000 * avgRelative, 2);
    market.indexHistory.push(newIndex || indexBefore);

    return events;
  }

  function stepMoment(market, day, slotIndex, totalSlots) {
    var relativeChanges = [];

    listStocks(market).forEach(function (stock) {
      var intradayScale = 1 / Math.sqrt(totalSlots || 6);

      var randomness = Utils.normalRandom() * stock.volatility * intradayScale * 0.55;
      var momentum = averageRecentReturn(stock, 3) * 0.08;
      var sentimentEffect = (stock.sentiment * 0.004) + (market.marketSentiment * 0.003);

      var rawReturn = randomness + momentum + sentimentEffect;
      var boundedReturn = Utils.clamp(rawReturn, -0.045, 0.045);

      stock.previousPrice = stock.price;
      stock.price = Math.max(1, Utils.round(stock.price * (1 + boundedReturn), 2));
      stock.returns.push(boundedReturn);
      stock.history.push(stock.price);
      stock.volume = Math.max(8000, Math.round(randomVolume(stock.price) * (1 + Math.abs(boundedReturn) * 5)));

      stock.sentiment *= 0.96;

      relativeChanges.push(stock.price / stock.initialPrice);
    });

    market.marketSentiment *= 0.97;

    var avgRelative = Utils.sum(relativeChanges) / relativeChanges.length;
    var newIndex = Utils.round(1000 * avgRelative, 2);

    market.indexHistory.push(newIndex || market.indexHistory[market.indexHistory.length - 1]);

    return [];
  }
  function averageRecentReturn(stock, count) {
    var returns = stock.returns.slice(-count);
    if (!returns.length) return 0;
    return Utils.sum(returns) / returns.length;
  }

  return {
    createMarket: createMarket,
    getPrice: getPrice,
    getStock: getStock,
    listStocks: listStocks,
    stepDay: stepDay,
    stepMoment: stepMoment
  };
})();
