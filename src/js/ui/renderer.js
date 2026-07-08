window.GMarket = window.GMarket || {};

window.GMarket.Renderer = (function () {
  var Utils = window.GMarket.Utils;
  var Game = window.GMarket.Game;
  var MarketEngine = window.GMarket.MarketEngine;
  var Portfolio = window.GMarket.Portfolio;
  var Risk = window.GMarket.Risk;
  var Chart = window.GMarket.Chart;

  var els = {};
  var autoTimer = null;

  function init() {
    cacheElements();
    bindEvents();
    render();
  }

  function cacheElements() {
    els.summary = document.getElementById("account-summary");
    els.marketDay = document.getElementById("market-day");
    els.stockList = document.getElementById("stock-list");
    els.selectedTitle = document.getElementById("selected-stock-title");
    els.selectedDesc = document.getElementById("selected-stock-desc");
    els.selectedPrice = document.getElementById("selected-price");
    els.chart = document.getElementById("main-chart");
    els.chartCaption = document.getElementById("chart-caption");
    els.btnNextDay = document.getElementById("btn-next-day");
    els.btnAuto = document.getElementById("btn-auto");
    els.btnReset = document.getElementById("btn-reset");
    els.btnOrder = document.getElementById("btn-order");
    els.orderSide = document.getElementById("order-side");
    els.orderQty = document.getElementById("order-qty");
    els.orderMessage = document.getElementById("order-message");
    els.portfolioTable = document.getElementById("portfolio-table");
    els.exposureTag = document.getElementById("exposure-tag");
    els.newsList = document.getElementById("news-list");
    els.riskBox = document.getElementById("risk-box");
    els.lessonBox = document.getElementById("lesson-box");
    els.tradeLog = document.getElementById("trade-log");
    els.tradeCount = document.getElementById("trade-count");
    els.btnChartStock = document.getElementById("btn-chart-stock");
    els.btnChartEquity = document.getElementById("btn-chart-equity");
  }

  function bindEvents() {
    els.btnNextDay.addEventListener("click", function () {
      Game.nextDay();
      render();
    });

    els.btnAuto.addEventListener("click", function () {
      var running = Game.toggleAuto();
      if (running) startAuto();
      else stopAuto();
      render();
    });

    els.btnReset.addEventListener("click", function () {
      var ok = window.confirm("确定要重置模拟吗？当前交易记录和持仓会被清空。");
      if (!ok) return;
      stopAuto();
      Game.reset();
      render();
    });

    els.btnOrder.addEventListener("click", function () {
      var result = Game.placeOrder(els.orderSide.value, els.orderQty.value);
      els.orderMessage.textContent = result.message;
      els.orderMessage.className = "message " + (result.success ? "positive" : "negative");
      render();
    });

    els.btnChartStock.addEventListener("click", function () {
      Game.setChartMode("stock");
      render();
    });

    els.btnChartEquity.addEventListener("click", function () {
      Game.setChartMode("equity");
      render();
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(function () {
      var state = window.GMarket.Game.getState();

      if (!state.isAutoRunning) {
        return;
      }

      window.GMarket.Game.nextDay();
      window.GMarket.Renderer.render();
    }, 1800);
  }

  function stopAuto() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function render() {
    var state = Game.getState();
    renderSummary(state);
    renderStocks(state);
    renderChart(state);
    renderTradePanel(state);
    renderPortfolio(state);
    renderNews(state);
    renderRisk(state);
    renderLesson(state);
    renderTrades(state);
    renderControls(state);
  }

  function renderSummary(state) {
    var equity = Portfolio.totalEquity(state.portfolio, state.market);
    var mv = Portfolio.marketValue(state.portfolio, state.market);
    var risk = Risk.metrics(state.portfolio, state.market);
    var index = state.market.indexHistory[state.market.indexHistory.length - 1];

    els.summary.innerHTML = [
      summaryCard("现金", Utils.formatMoney(state.portfolio.cash)),
      summaryCard("持仓市值", Utils.formatMoney(mv)),
      summaryCard("总资产", Utils.formatMoney(equity), Utils.classBySign(equity - state.portfolio.initialCash)),
      summaryCard("累计收益", Utils.formatPercent(risk.totalReturn), Utils.classBySign(risk.totalReturn)),
      summaryCard("市场指数", index.toFixed(2))
    ].join("");

    els.marketDay.textContent = "第 " + state.day + " 天";
  }

  function summaryCard(label, value, valueClass) {
    return "<div class=\"summary-card\"><div class=\"label\">" + escapeHtml(label) + "</div><div class=\"value " + (valueClass || "") + "\">" + escapeHtml(value) + "</div></div>";
  }

  function renderStocks(state) {
    var html = MarketEngine.listStocks(state.market).map(function (stock) {
      var change = stock.previousPrice ? (stock.price - stock.previousPrice) / stock.previousPrice : 0;
      var active = stock.symbol === state.selectedSymbol ? " active" : "";
      return "<button class=\"stock-card" + active + "\" data-symbol=\"" + stock.symbol + "\">" +
        "<div>" +
          "<div class=\"stock-symbol\">" + stock.symbol + "</div>" +
          "<div class=\"stock-name\">" + escapeHtml(stock.name) + "</div>" +
          "<div class=\"stock-sector\">" + escapeHtml(stock.sector) + " · 成交量 " + Utils.formatNumber(stock.volume) + "</div>" +
        "</div>" +
        "<div>" +
          "<div class=\"stock-price\">" + Utils.formatMoney(stock.price) + "</div>" +
          "<div class=\"stock-change " + Utils.classBySign(change) + "\">" + Utils.formatPercent(change) + "</div>" +
        "</div>" +
      "</button>";
    }).join("");

    els.stockList.innerHTML = html;
    Array.prototype.forEach.call(els.stockList.querySelectorAll(".stock-card"), function (card) {
      card.addEventListener("click", function () {
        Game.selectStock(card.getAttribute("data-symbol"));
        render();
      });
    });
  }

  function renderChart(state) {
    var selected = MarketEngine.getStock(state.market, state.selectedSymbol);
    var isEquity = state.chartMode === "equity";
    var series = isEquity ? state.portfolio.equityHistory : selected.history;
    var title = isEquity ? "账户净值曲线" : selected.symbol + " " + selected.name;
    var prefix = isEquity ? "¥" : "¥";

    els.selectedTitle.textContent = title;
    els.selectedDesc.textContent = isEquity ? "观察总资产随交易和行情变化的走势。" : selected.description;

    Chart.drawLineChart(els.chart, series, {
      title: title,
      prefix: prefix
    });

    els.chartCaption.textContent = isEquity
      ? "账户净值会同时受到持仓价格、现金比例、交易手续费和仓位结构影响。"
      : "个股价格由长期趋势、波动率、市场情绪、板块事件和随机扰动共同决定。";

    els.btnChartStock.classList.toggle("active", !isEquity);
    els.btnChartEquity.classList.toggle("active", isEquity);
  }

  function renderTradePanel(state) {
    var selected = MarketEngine.getStock(state.market, state.selectedSymbol);
    els.selectedPrice.textContent = Utils.formatMoney(selected.price);
    if (!els.orderMessage.textContent) {
      els.orderMessage.textContent = state.lastMessage;
    }
  }

  function renderPortfolio(state) {
    var positions = Portfolio.listPositions(state.portfolio, state.market);
    var risk = Risk.metrics(state.portfolio, state.market);
    els.exposureTag.textContent = "仓位 " + Utils.formatPercent(risk.exposure);

    if (!positions.length) {
      els.portfolioTable.innerHTML = "<tr><td colspan=\"5\" class=\"empty\">暂无持仓。可以先用少量资金买入一只股票观察波动。</td></tr>";
      return;
    }

    els.portfolioTable.innerHTML = positions.map(function (item) {
      return "<tr>" +
        "<td>" + item.symbol + "</td>" +
        "<td>" + Utils.formatNumber(item.quantity) + "</td>" +
        "<td>" + Utils.formatMoney(item.avgCost) + "</td>" +
        "<td>" + Utils.formatMoney(item.price) + "</td>" +
        "<td class=\"" + Utils.classBySign(item.pnl) + "\">" + Utils.formatMoney(item.pnl) + " / " + Utils.formatPercent(item.pnlRate) + "</td>" +
      "</tr>";
    }).join("");
  }

  function renderNews(state) {
    var news = state.market.triggeredEvents.slice(0, 5);
    if (!news.length) {
      els.newsList.innerHTML = "<div class=\"empty\">暂未发生重大新闻。继续推进时间后，市场会逐步出现事件冲击。</div>";
      return;
    }

    els.newsList.innerHTML = news.map(function (item) {
      return "<article class=\"news-item\">" +
        "<h3>第 " + item.day + " 天｜" + escapeHtml(item.title) + "</h3>" +
        "<p>影响对象：" + escapeHtml(labelTarget(item)) + "；冲击幅度：<span class=\"" + Utils.classBySign(item.impact) + "\">" + Utils.formatPercent(item.impact) + "</span></p>" +
        "<p>" + escapeHtml(item.description) + "</p>" +
      "</article>";
    }).join("");
  }

  function labelTarget(item) {
    if (item.targetType === "market") return "全市场";
    if (item.targetType === "sector") return item.target + "板块";
    return item.target;
  }

  function renderRisk(state) {
    var risk = Risk.metrics(state.portfolio, state.market);
    els.riskBox.innerHTML = [
      riskItem("风险等级", risk.riskLevel.label, risk.riskLevel.text),
      riskItem("最大回撤", Utils.formatPercent(risk.maxDrawdown), "回撤越大，账户从亏损中恢复越困难。"),
      riskItem("持仓集中度", Utils.formatPercent(risk.concentration), "单一股票占比越高，个股事件对账户影响越大。")
    ].join("");
  }

  function riskItem(label, value, text) {
    return "<div class=\"risk-item\"><p><strong>" + escapeHtml(label) + "：</strong>" + escapeHtml(value) + "</p><p>" + escapeHtml(text) + "</p></div>";
  }

  function renderLesson(state) {
    var lesson = window.GMarket.LESSONS.filter(function (item) {
      return item.minDay <= state.day;
    }).slice(-1)[0];

    if (!lesson) {
      els.lessonBox.innerHTML = "";
      return;
    }

    els.lessonBox.innerHTML = "<article class=\"lesson-item\"><h3>课堂提示｜" + escapeHtml(lesson.title) + "</h3><p>" + escapeHtml(lesson.text) + "</p></article>";
  }

  function renderTrades(state) {
    els.tradeCount.textContent = state.portfolio.trades.length + " 笔";
    if (!state.portfolio.trades.length) {
      els.tradeLog.innerHTML = "<div class=\"empty\">暂无交易记录。</div>";
      return;
    }

    els.tradeLog.innerHTML = state.portfolio.trades.slice(0, 30).map(function (trade) {
      var sideText = trade.side === "buy" ? "买入" : "卖出";
      var sideClass = trade.side === "buy" ? "positive" : "negative";
      return "<article class=\"trade-item\">" +
        "<p><strong class=\"" + sideClass + "\">第 " + trade.day + " 天 " + sideText + " " + trade.symbol + "</strong></p>" +
        "<p>数量 " + Utils.formatNumber(trade.quantity) + "，价格 " + Utils.formatMoney(trade.price) + "，手续费 " + Utils.formatMoney(trade.fee) + "，成交额 " + Utils.formatMoney(trade.amount) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderControls(state) {
    els.btnAuto.textContent = state.isAutoRunning ? "暂停自动" : "自动运行";
    if (state.isAutoRunning && !autoTimer) startAuto();
    if (!state.isAutoRunning && autoTimer) stopAuto();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    init: init,
    render: render
  };
})();
