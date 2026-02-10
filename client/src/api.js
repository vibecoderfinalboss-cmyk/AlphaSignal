const API_URL = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("alphasignal_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  register: (handle, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ handle, password }),
    }),

  login: (handle, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ handle, password }),
    }),

  getUser: () => request("/user"),

  updateUser: (data) =>
    request("/user", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMissions: () => request("/missions"),

  getFarmTasks: () => request("/farm-tasks"),

  getFeed: () => request("/feed"),

  completeMission: (missionId) =>
    request("/user/complete-mission", {
      method: "POST",
      body: JSON.stringify({ missionId }),
    }),

  completeFarmStep: (taskId, stepIndex) =>
    request("/user/complete-farm-step", {
      method: "POST",
      body: JSON.stringify({ taskId, stepIndex }),
    }),
};
