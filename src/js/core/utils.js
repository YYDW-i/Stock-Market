window.GMarket = window.GMarket || {};

window.GMarket.Utils = (function () {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function round(value, digits) {
    var factor = Math.pow(10, digits || 2);
    return Math.round(value * factor) / factor;
  }

  function formatMoney(value) {
    return "¥" + Number(value || 0).toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function formatPercent(value) {
    var sign = value > 0 ? "+" : "";
    return sign + (value * 100).toFixed(2) + "%";
  }

  function classBySign(value) {
    if (value > 0.000001) return "positive";
    if (value < -0.000001) return "negative";
    return "neutral";
  }

  function normalRandom() {
    var u = 0;
    var v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sum(arr) {
    return arr.reduce(function (acc, item) { return acc + item; }, 0);
  }

  return {
    clamp: clamp,
    round: round,
    formatMoney: formatMoney,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    classBySign: classBySign,
    normalRandom: normalRandom,
    deepClone: deepClone,
    sum: sum
  };
})();
