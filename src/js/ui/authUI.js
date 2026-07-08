window.GMarket = window.GMarket || {};

window.GMarket.AuthUI = (function () {
  var Api = window.GMarket.Api;
  var Game = window.GMarket.Game;
  var Renderer = window.GMarket.Renderer;

  var els = {};

  function init() {
    cacheElements();
    bindEvents();
    refreshAuthUI();
  }

  function cacheElements() {
    els.guestAuthBox = document.getElementById("guestAuthBox");
    els.userAuthBox = document.getElementById("userAuthBox");

    els.authUsername = document.getElementById("authUsername");
    els.authPassword = document.getElementById("authPassword");

    els.loginBtn = document.getElementById("loginBtn");
    els.registerBtn = document.getElementById("registerBtn");
    els.logoutBtn = document.getElementById("logoutBtn");

    els.currentUsername = document.getElementById("currentUsername");

    els.saveGameBtn = document.getElementById("saveGameBtn");
    els.loadGameBtn = document.getElementById("loadGameBtn");

    els.noteInput = document.getElementById("noteInput");
    els.addNoteBtn = document.getElementById("addNoteBtn");
    els.noteList = document.getElementById("noteList");

    els.authMessage = document.getElementById("authMessage");
    els.userMessage = document.getElementById("userMessage");

    els.authPage = document.getElementById("authPage");
    els.appPage = document.getElementById("appPage");
  }

  function bindEvents() {
    if (els.loginBtn) {
      els.loginBtn.addEventListener("click", handleLogin);
    }

    if (els.registerBtn) {
      els.registerBtn.addEventListener("click", handleRegister);
    }

    if (els.logoutBtn) {
      els.logoutBtn.addEventListener("click", handleLogout);
    }

    if (els.saveGameBtn) {
      els.saveGameBtn.addEventListener("click", handleSaveGame);
    }

    if (els.loadGameBtn) {
      els.loadGameBtn.addEventListener("click", handleLoadGame);
    }

    if (els.addNoteBtn) {
      els.addNoteBtn.addEventListener("click", handleAddNote);
    }
  }

  function getAuthInput() {
    return {
      username: els.authUsername ? els.authUsername.value.trim() : "",
      password: els.authPassword ? els.authPassword.value : ""
    };
  }

  function handleLogin() {
    var input = getAuthInput();

    setAuthMessage("正在登录...");

    Api.login(input.username, input.password)
      .then(function () {
        setAuthMessage("登录成功。");
        return refreshAuthUI();
      })
      .catch(function (error) {
        setAuthMessage(error.message);
      });
  }

  function handleRegister() {
    var input = getAuthInput();

    setAuthMessage("正在注册...");

    Api.register(input.username, input.password)
      .then(function () {
        setAuthMessage("注册成功，已自动登录。");
        return refreshAuthUI();
      })
      .catch(function (error) {
        setAuthMessage(error.message);
      });
  }

  function handleLogout() {
    Api.logout().then(function () {
      setUserMessage("");
      setAuthMessage("已退出登录。");
      refreshAuthUI();
    });
  }

  function handleSaveGame() {
    if (!Api.isLoggedIn()) {
      setUserMessage("请先登录再保存进度。");
      return;
    }

    setUserMessage("正在保存进度...");

    Api.saveGameState(Game.getSaveData())
      .then(function (result) {
        var time = result.updatedAt ? new Date(result.updatedAt).toLocaleString() : "";
        setUserMessage("保存成功。" + (time ? "保存时间：" + time : ""));
      })
      .catch(function (error) {
        setUserMessage(error.message);
      });
  }

  function handleLoadGame() {
    if (!Api.isLoggedIn()) {
      setUserMessage("请先登录再读取进度。");
      return;
    }

    setUserMessage("正在读取进度...");

    Api.loadGameState()
      .then(function (save) {
        if (!save) {
          setUserMessage("当前账号还没有云端存档。");
          return;
        }

        var result = Game.loadSaveData(save);

        if (!result.success) {
          setUserMessage(result.message);
          return;
        }

        if (Renderer && typeof Renderer.render === "function") {
          Renderer.render();
        }

        setUserMessage(result.message);
      })
      .catch(function (error) {
        setUserMessage(error.message);
      });
  }

  function handleAddNote() {
    if (!Api.isLoggedIn()) {
      setUserMessage("请先登录再保存输入内容。");
      return;
    }

    var content = els.noteInput ? els.noteInput.value.trim() : "";

    if (!content) {
      setUserMessage("输入内容不能为空。");
      return;
    }

    Api.addNote(content)
      .then(function () {
        if (els.noteInput) {
          els.noteInput.value = "";
        }

        setUserMessage("输入内容已保存。");
        return refreshNotes();
      })
      .catch(function (error) {
        setUserMessage(error.message);
      });
  }

  function refreshAuthUI() {
    if (!els.guestAuthBox || !els.userAuthBox) {
      return Promise.resolve();
    }

    if (!Api.isLoggedIn()) {
      showGuest();
      return Promise.resolve();
    }

    return Api.getCurrentUser()
      .then(function (user) {
        showUser(user);
        return refreshNotes();
      })
      .catch(function () {
        return Api.logout().then(function () {
          showGuest();
        });
      });
  }

  function showGuest() {
    if (els.authPage) {
      els.authPage.classList.remove("hidden");
    }

    if (els.appPage) {
      els.appPage.classList.add("hidden");
    }

    if (els.guestAuthBox) {
      els.guestAuthBox.classList.remove("hidden");
    }

    if (els.userAuthBox) {
      els.userAuthBox.classList.add("hidden");
    }
  }

  function showUser(user) {
    if (els.authPage) {
      els.authPage.classList.add("hidden");
    }

    if (els.appPage) {
      els.appPage.classList.remove("hidden");
    }

    if (els.guestAuthBox) {
      els.guestAuthBox.classList.add("hidden");
    }

    if (els.userAuthBox) {
      els.userAuthBox.classList.remove("hidden");
    }

    if (els.currentUsername) {
      els.currentUsername.textContent = user.username;
    }

    if (window.GMarket.Renderer && typeof window.GMarket.Renderer.render === "function") {
      window.GMarket.Renderer.render();
    }
  }

  function refreshNotes() {
    if (!els.noteList || !Api.isLoggedIn()) {
      return Promise.resolve();
    }

    return Api.listNotes()
      .then(function (notes) {
        if (!notes.length) {
          els.noteList.innerHTML = "<div class=\"note-item\">暂无保存内容。</div>";
          return;
        }

        els.noteList.innerHTML = notes.map(function (note) {
          return "<div class=\"note-item\">" +
            "<div class=\"note-content\">" + escapeHtml(note.content) + "</div>" +
            "<div class=\"note-time\">" + new Date(note.createdAt).toLocaleString() + "</div>" +
            "<button class=\"delete-note-btn\" type=\"button\" data-note-id=\"" + escapeHtml(note.id) + "\">删除</button>" +
          "</div>";
        }).join("");

        bindDeleteNoteButtons();
      })
      .catch(function (error) {
        setUserMessage(error.message);
      });
  }

  function bindDeleteNoteButtons() {
    var buttons = els.noteList.querySelectorAll(".delete-note-btn");

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        var noteId = button.getAttribute("data-note-id");

        Api.deleteNote(noteId)
          .then(function () {
            setUserMessage("内容已删除。");
            return refreshNotes();
          })
          .catch(function (error) {
            setUserMessage(error.message);
          });
      });
    });
  }

  function setAuthMessage(message) {
    if (els.authMessage) {
      els.authMessage.textContent = message || "";
    }
  }

  function setUserMessage(message) {
    if (els.userMessage) {
      els.userMessage.textContent = message || "";
    }
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
    refreshAuthUI: refreshAuthUI,
    refreshNotes: refreshNotes
  };
})();