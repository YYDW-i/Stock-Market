window.GMarket = window.GMarket || {};

window.GMarket.Risk = (function () {
  var Utils = window.GMarket.Utils;

  function maxDrawdown(history) {
    if (!history || history.length < 2) return 0;
    var peak = history[0];
    var maxDd = 0;

    history.forEach(function (value) {
      if (value > peak) peak = value;
      var dd = peak > 0 ? (peak - value) / peak : 0;
      if (dd > maxDd) maxDd = dd;
    });

    return maxDd;
  }

  function exposure(portfolio, market) {
    var equity = window.GMarket.Portfolio.totalEquity(portfolio, market);
    var mv = window.GMarket.Portfolio.marketValue(portfolio, market);
    return equity > 0 ? mv / equity : 0;
  }

  function concentration(portfolio, market) {
    var positions = window.GMarket.Portfolio.listPositions(portfolio, market);
    var total = positions.reduce(function (acc, item) { return acc + item.value; }, 0);
    if (!total) return 0;
    var largest = Math.max.apply(null, positions.map(function (item) { return item.value; }));
    return largest / total;
  }

  function totalReturn(portfolio, market) {
    var equity = window.GMarket.Portfolio.totalEquity(portfolio, market);
    return portfolio.initialCash > 0 ? (equity - portfolio.initialCash) / portfolio.initialCash : 0;
  }

  function riskLevel(portfolio, market) {
    var exp = exposure(portfolio, market);
    var conc = concentration(portfolio, market);
    var dd = maxDrawdown(portfolio.equityHistory);
    var score = exp * 0.45 + conc * 0.25 + dd * 1.3;

    if (score < 0.32) return { label: "较低", text: "当前风险相对温和，但仍要关注单日波动。" };
    if (score < 0.62) return { label: "中等", text: "当前风险已经不低，注意仓位和持仓集中度。" };
    return { label: "较高", text: "账户风险偏高，一次较大下跌可能造成明显回撤。" };
  }

  function metrics(portfolio, market) {
    return {
      totalReturn: totalReturn(portfolio, market),
      maxDrawdown: maxDrawdown(portfolio.equityHistory),
      exposure: exposure(portfolio, market),
      concentration: concentration(portfolio, market),
      riskLevel: riskLevel(portfolio, market)
    };
  }

  return {
    maxDrawdown: maxDrawdown,
    exposure: exposure,
    concentration: concentration,
    totalReturn: totalReturn,
    riskLevel: riskLevel,
    metrics: metrics
  };
})();
