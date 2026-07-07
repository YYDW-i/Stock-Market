const API_BASE = window.GMARKET_API_BASE || "http://localhost:3000/api";
const TOKEN_KEY = "gmarket_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error("无法连接本地后端。请先运行 start_windows.bat，或在 backend 目录执行 npm start。");
  }

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "请求失败");
  }

  return data;
}

export async function register(username, password) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  });

  setToken(data.token);
  return data.user;
}

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  });

  setToken(data.token);
  return data.user;
}

export async function logout() {
  clearToken();
}

export async function getCurrentUser() {
  const data = await request("/me");
  return data.user;
}

export async function saveGameState(save) {
  return request("/game/save", {
    method: "PUT",
    body: JSON.stringify({
      save
    })
  });
}

export async function loadGameState() {
  const data = await request("/game/save");
  return data.save;
}

export async function deleteGameSave() {
  return request("/game/save", {
    method: "DELETE"
  });
}

export async function listNotes() {
  const data = await request("/game/notes");
  return data.notes;
}

export async function addNote(content) {
  const data = await request("/game/notes", {
    method: "POST",
    body: JSON.stringify({
      content
    })
  });

  return data.note;
}

export async function deleteNote(noteId) {
  return request(`/game/notes/${encodeURIComponent(noteId)}`, {
    method: "DELETE"
  });
}