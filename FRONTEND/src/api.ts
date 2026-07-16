import {
  User,
  Protocol,
  ProtocolVersion,
  Risk,
  AdverseEvent,
  Milestone,
  ChecklistItem,
  Review,
  Report,
  Setting,
  DashboardStats,
} from "./types";

const BASE_URL = "https://xebia-capstone-project-1.onrender.com"; // Relative to the host since we run Express on port 3000 alongside Vite middleware

// Token Helpers
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string) {
  localStorage.setItem("accessToken", token);
}

export function removeAccessToken() {
  localStorage.removeItem("accessToken");
}

// Global Auth Failure Handler Reference
let onAuthFailureHandler: (() => void) | null = null;

export function registerOnAuthFailure(handler: () => void) {
  onAuthFailureHandler = handler;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; meta?: any }> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAccessToken();
    if (onAuthFailureHandler) {
      onAuthFailureHandler();
    }
  }

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.message || `Request failed with status ${response.status}`);
  }

  return resJson;
}

export const api = {
  // 1. Auth Endpoints
  async register(body: any) {
    return request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async login(body: any) {
    const res = await request<{ user: User; accessToken: string; refreshToken: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },

  async logout() {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } finally {
      removeAccessToken();
    }
  },

  async getMe() {
    return request<{ user: User }>("/api/auth/me", { method: "GET" });
  },

  // 2. Dashboard Stats
  async getDashboardStats() {
    return request<{ stats: DashboardStats }>("/api/dashboard", { method: "GET" });
  },

  // 3. Protocols Library
  async listProtocols(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
    phase?: string;
  } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        query.set(key, String(val));
      }
    });
    return request<{ protocols: Protocol[] }>(
      `/api/protocols?${query.toString()}`,
      { method: "GET" }
    );
  },

  async createProtocol(body: Partial<Protocol>) {
    return request<{ protocol: Protocol }>("/api/protocols", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getProtocol(id: string) {
    return request<{ protocol: Protocol }>(`/api/protocols/${id}`, { method: "GET" });
  },

  async updateProtocol(id: string, body: Partial<Protocol> & { changeSummary?: string }) {
    return request<{ protocol: Protocol }>(`/api/protocols/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteProtocol(id: string) {
    return request(`/api/protocols/${id}`, { method: "DELETE" });
  },

  async duplicateProtocol(id: string) {
    return request<{ protocol: Protocol }>(`/api/protocols/${id}/duplicate`, {
      method: "POST",
    });
  },

  async getVersionHistory(id: string) {
    return request<{ versions: ProtocolVersion[] }>(`/api/protocols/${id}/versions`, {
      method: "GET",
    });
  },

  // 4. Protocol Generator
  async generateProtocol(body: any) {
    return request<{ generatedDocument: any; savedReportId: string | null }>(
      "/api/protocol-generator",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  // 5. Sample Size Calculator
  async calculateSampleSize(body: {
    effectSize: number;
    power: number;
    alpha: number;
    dropoutRate?: number;
    population?: number | null;
  }) {
    return request<{
      sampleSize: number;
      totalSampleSizeWithDropout: number;
      calculationMethod: string;
      parameters: any;
    }>("/api/sample-size", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // 6. Risks
  async listRisks(protocolId: string) {
    return request<{ risks: Risk[] }>(`/api/protocols/${protocolId}/risks`, {
      method: "GET",
    });
  },

  async createRisk(protocolId: string, body: Partial<Risk>) {
    return request<{ risk: Risk }>(`/api/protocols/${protocolId}/risks`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getRisk(id: string) {
    return request<{ risk: Risk }>(`/api/risks/${id}`, { method: "GET" });
  },

  async updateRisk(id: string, body: Partial<Risk>) {
    return request<{ risk: Risk }>(`/api/risks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteRisk(id: string) {
    return request(`/api/risks/${id}`, { method: "DELETE" });
  },

  // 7. Adverse Events
  async listAdverseEvents(protocolId: string) {
    return request<{ adverseEvents: AdverseEvent[] }>(
      `/api/protocols/${protocolId}/adverse-events`,
      { method: "GET" }
    );
  },

  async createAdverseEvent(protocolId: string, body: Partial<AdverseEvent>) {
    return request<{ adverseEvent: AdverseEvent }>(
      `/api/protocols/${protocolId}/adverse-events`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  async getAdverseEvent(id: string) {
    return request<{ adverseEvent: AdverseEvent }>(`/api/adverse-events/${id}`, {
      method: "GET",
    });
  },

  async updateAdverseEvent(id: string, body: Partial<AdverseEvent>) {
    return request<{ adverseEvent: AdverseEvent }>(`/api/adverse-events/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteAdverseEvent(id: string) {
    return request(`/api/adverse-events/${id}`, { method: "DELETE" });
  },

  // 8. Milestones
  async listMilestones(protocolId: string) {
    return request<{ milestones: Milestone[] }>(`/api/protocols/${protocolId}/milestones`, {
      method: "GET",
    });
  },

  async createMilestone(protocolId: string, body: Partial<Milestone>) {
    return request<{ milestone: Milestone }>(`/api/protocols/${protocolId}/milestones`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getMilestone(id: string) {
    return request<{ milestone: Milestone }>(`/api/milestones/${id}`, { method: "GET" });
  },

  async updateMilestone(id: string, body: Partial<Milestone>) {
    return request<{ milestone: Milestone }>(`/api/milestones/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteMilestone(id: string) {
    return request(`/api/milestones/${id}`, { method: "DELETE" });
  },

  // 9. Checklist
  async getChecklist(protocolId: string) {
    return request<{ items: ChecklistItem[]; completionPercentage: number; totalItems: number }>(
      `/api/protocols/${protocolId}/checklist`,
      { method: "GET" }
    );
  },

  async createChecklistItem(protocolId: string, body: { label: string; category: string; order?: number }) {
    return request<{ item: ChecklistItem }>(`/api/protocols/${protocolId}/checklist`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateChecklistItem(id: string, body: Partial<ChecklistItem>) {
    return request<{ item: ChecklistItem }>(`/api/checklist/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteChecklistItem(id: string) {
    return request(`/api/checklist/${id}`, { method: "DELETE" });
  },

  // 10. Peer Reviews
  async listReviews(protocolId: string) {
    return request<{ reviews: Review[] }>(`/api/protocols/${protocolId}/reviews`, {
      method: "GET",
    });
  },

  async createReview(protocolId: string, body: { decision?: string; comments?: string; score?: number }) {
    return request<{ review: Review }>(`/api/protocols/${protocolId}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getReview(id: string) {
    return request<{ review: Review }>(`/api/reviews/${id}`, { method: "GET" });
  },

  async deleteReview(id: string) {
    return request(`/api/reviews/${id}`, { method: "DELETE" });
  },

  async approveReview(id: string, body: { comments?: string; score?: number }) {
    return request<{ review: Review }>(`/api/reviews/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async minorRevisionReview(id: string, body: { comments?: string; score?: number }) {
    return request<{ review: Review }>(`/api/reviews/${id}/minor-revision`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async majorRevisionReview(id: string, body: { comments?: string; score?: number }) {
    return request<{ review: Review }>(`/api/reviews/${id}/major-revision`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async rejectReview(id: string, body: { comments?: string; score?: number }) {
    return request<{ review: Review }>(`/api/reviews/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  // 11. Reports
  async listReports(protocolId: string) {
    return request<{ reports: Report[] }>(`/api/protocols/${protocolId}/reports`, {
      method: "GET",
    });
  },

  async generateReport(protocolId: string, body: { type: string; format?: string }) {
    return request<{ report: Report }>(`/api/protocols/${protocolId}/reports`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getReport(id: string) {
    return request<{ report: Report }>(`/api/reports/${id}`, { method: "GET" });
  },

  // 12. Settings
  async listSettings() {
    return request<{ settings: Setting[] }>("/api/settings", { method: "GET" });
  },

  async getSetting(key: string) {
    return request<{ setting: Setting }>(`/api/settings/${key}`, { method: "GET" });
  },

  async updateSetting(key: string, body: { value: string; description?: string }) {
    return request<{ setting: Setting }>(`/api/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
