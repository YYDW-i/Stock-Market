window.GMarket = window.GMarket || {};

window.GMarket.Storage = (function () {
  var KEY = "gmarket-stock-simulator-v1";

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("保存失败：", error);
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn("读取存档失败：", error);
      return null;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      console.warn("清除存档失败：", error);
    }
  }

  return {
    save: save,
    load: load,
    clear: clear
  };
})();
