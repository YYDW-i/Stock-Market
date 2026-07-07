window.GMarket = window.GMarket || {};

window.GMarket.Api = (function () {
  var API_BASE = window.GMARKET_API_BASE || "http://localhost:3000/api";
  var TOKEN_KEY = "gmarket_auth_token";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function request(path, options) {
    options = options || {};

    var token = getToken();

    var headers = {
      "Content-Type": "application/json"
    };

    if (options.headers) {
      Object.keys(options.headers).forEach(function (key) {
        headers[key] = options.headers[key];
      });
    }

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    return fetch(API_BASE + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body
    }).then(function (response) {
      return response.json()
        .catch(function () {
          return {};
        })
        .then(function (data) {
          if (!response.ok) {
            throw new Error(data.message || "请求失败");
          }
          return data;
        });
    }).catch(function (error) {
      if (error && error.message) {
        throw error;
      }

      throw new Error("无法连接本地后端。请先运行 start_windows.bat，或在 backend 目录执行 npm start。");
    });
  }

  function register(username, password) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password
      })
    }).then(function (data) {
      setToken(data.token);
      return data.user;
    });
  }

  function login(username, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password
      })
    }).then(function (data) {
      setToken(data.token);
      return data.user;
    });
  }

  function logout() {
    clearToken();
    return Promise.resolve();
  }

  function getCurrentUser() {
    return request("/me").then(function (data) {
      return data.user;
    });
  }

  function saveGameState(save) {
    return request("/game/save", {
      method: "PUT",
      body: JSON.stringify({
        save: save
      })
    });
  }

  function loadGameState() {
    return request("/game/save").then(function (data) {
      return data.save;
    });
  }

  function deleteGameSave() {
    return request("/game/save", {
      method: "DELETE"
    });
  }

  function listNotes() {
    return request("/game/notes").then(function (data) {
      return data.notes || [];
    });
  }

  function addNote(content) {
    return request("/game/notes", {
      method: "POST",
      body: JSON.stringify({
        content: content
      })
    }).then(function (data) {
      return data.note;
    });
  }

  function deleteNote(noteId) {
    return request("/game/notes/" + encodeURIComponent(noteId), {
      method: "DELETE"
    });
  }

  return {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    isLoggedIn: isLoggedIn,
    register: register,
    login: login,
    logout: logout,
    getCurrentUser: getCurrentUser,
    saveGameState: saveGameState,
    loadGameState: loadGameState,
    deleteGameSave: deleteGameSave,
    listNotes: listNotes,
    addNote: addNote,
    deleteNote: deleteNote
  };
})();