window.addEventListener("DOMContentLoaded", function () {
  window.GMarket.Game.init();
  window.GMarket.Renderer.init();

  if (window.GMarket.AuthUI) {
    window.GMarket.AuthUI.init();
  }

  setupAutoSave();
});

function setupAutoSave() {
  var Api = window.GMarket.Api;
  var Game = window.GMarket.Game;

  if (!Api || !Game) {
    return;
  }

  var AUTO_SAVE_INTERVAL = 30 * 1000;

  setInterval(function () {
    if (!Api.isLoggedIn()) {
      return;
    }

    if (typeof Game.getSaveData !== "function") {
      return;
    }

    Api.saveGameState(Game.getSaveData())
      .then(function () {
        console.log("自动存档完成");
      })
      .catch(function (error) {
        console.warn("自动存档失败：", error.message);
      });
  }, AUTO_SAVE_INTERVAL);
}