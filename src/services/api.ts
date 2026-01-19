const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

// ----------------------------------------------------------------------

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ----------------------------------------------------------------------

export const api = {
  // Auth
  login: (data: any) => request<{ accessToken: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<{ userId: string; message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: any) => request<{ message: string }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  // Teams
  getTeams: () => request<{ teams: any[] }>('/teams'),
  getTeam: (id: string) => request<{ team: any }>(`/teams/${id}`),
  createTeam: (data: any) => request<{ team: any }>('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: any) => request<{ team: any }>(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id: string) => request(`/teams/${id}`, { method: 'DELETE' }),
  addTeamMember: (teamId: string, userId: string, role: string) =>
    request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),
  removeTeamMember: (teamId: string, memberId: string) =>
    request(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),

  // Projects
  getProjects: (teamId?: string) => request<{ projects: any[] }>(teamId ? `/teams/${teamId}/projects` : '/projects'),
  getProject: (id: string) => request<{ project: any }>(`/projects/${id}`),
  createProject: (data: any) => request<{ project: any }>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<{ project: any }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  addProjectMember: (projectId: string, userId: string, role: string) =>
    request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),

  // Tasks
  getTasks: (projectId: string) => request<{ tasks: any[] }>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, data: any) =>
    request<{ task: any }>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (projectId: string, taskId: string, data: any) =>
    request<{ task: any }>(`/projects/${projectId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (projectId: string, taskId: string) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Chats
  getChats: () => request<{ chats: any[] }>('/chats'),
  getChat: (id: string) => request<{ chat: any }>(`/chats/${id}`),
  getChatMessages: (chatId: string) => request<{ messages: any[] }>(`/chats/${chatId}/messages`),
  createPrivateChat: (userId: string) => request<{ chat: any }>('/chats/private', { method: 'POST', body: JSON.stringify({ userId }) }),
  createProjectChat: (projectId: string) =>
    request<{ chat: any }>('/chats/project', { method: 'POST', body: JSON.stringify({ projectId }) }),

  // Notifications
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),
  markNotificationAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'PUT' }),
};

