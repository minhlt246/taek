// Admin API service for CRUD operations
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if needed
      // 'Authorization': `Bearer ${token}`,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Branches API
export const branchesApi = {
  getAll: () => apiRequest("/branches"),
  getById: (id: number) => apiRequest(`/branches/${id}`),
  create: (data: any) =>
    apiRequest("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/branches/${id}`, {
      method: "DELETE",
    }),
};

// Courses API
export const coursesApi = {
  getAll: () => apiRequest("/courses"),
  getById: (id: number) => apiRequest(`/courses/${id}`),
  create: (data: any) =>
    apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/courses/${id}`, {
      method: "DELETE",
    }),
};

// Events API
export const eventsApi = {
  getAll: () => apiRequest("/events"),
  getById: (id: number) => apiRequest(`/events/${id}`),
  create: (data: any) =>
    apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/events/${id}`, {
      method: "DELETE",
    }),
};

// News API
export const newsApi = {
  getAll: () => apiRequest("/news"),
  getById: (id: number) => apiRequest(`/news/${id}`),
  create: (data: any) =>
    apiRequest("/news", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/news/${id}`, {
      method: "DELETE",
    }),
  publish: (id: number) =>
    apiRequest(`/news/${id}/publish`, {
      method: "POST",
    }),
};

// Belt Levels API
export const beltLevelsApi = {
  getAll: () => apiRequest("/belt-levels"),
  getById: (id: number) => apiRequest(`/belt-levels/${id}`),
  create: (data: any) =>
    apiRequest("/belt-levels", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/belt-levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/belt-levels/${id}`, {
      method: "DELETE",
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest("/users"),
  getById: (id: number) => apiRequest(`/users/${id}`),
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (data: any) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (data: any) =>
    apiRequest("/users/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Settings API
export const settingsApi = {
  getAll: () => apiRequest("/settings"),
  update: (data: any) =>
    apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  reset: () =>
    apiRequest("/settings/reset", {
      method: "POST",
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest("/dashboard/stats"),
  getRecentActivities: () => apiRequest("/dashboard/activities"),
};

// Clubs API
export const clubsApi = {
  getAll: () => apiRequest("/clubs"),
  getById: (id: number) => apiRequest(`/clubs/${id}`),
  create: (data: any) =>
    apiRequest("/clubs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/clubs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/clubs/${id}`, {
      method: "DELETE",
    }),
};

// Coaches API
export const coachesApi = {
  getAll: () => apiRequest("/coaches"),
  getById: (id: number) => apiRequest(`/coaches/${id}`),
  create: (data: any) =>
    apiRequest("/coaches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/coaches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/coaches/${id}`, {
      method: "DELETE",
    }),
};

// Payments API
export const paymentsApi = {
  getAll: () => apiRequest("/payments"),
  getById: (id: number) => apiRequest(`/payments/${id}`),
  create: (data: any) =>
    apiRequest("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiRequest(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/payments/${id}`, {
      method: "DELETE",
    }),
};

export default {
  branchesApi,
  coursesApi,
  eventsApi,
  newsApi,
  beltLevelsApi,
  usersApi,
  settingsApi,
  dashboardApi,
  clubsApi,
  coachesApi,
  paymentsApi,
};
