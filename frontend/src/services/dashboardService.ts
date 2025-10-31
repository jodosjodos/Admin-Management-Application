import apiClient from "./api";

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  savings: {
    totalAccounts: number;
    totalBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  credit: {
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
    totalDisbursed: number;
    totalRepaid: number;
    outstandingBalance: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    volume: number;
  };
  growth: {
    usersGrowth: number;
    savingsGrowth: number;
    creditGrowth: number;
  };
}

export interface CreditRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  creditScore: number;
  repaymentPeriod: number;
  purpose: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  amount?: number;
  timestamp: string;
}

export const dashboardService = {
  getStats: async (): Promise<{ stats: DashboardStats }> => {
    const response = await apiClient.get("/dashboard/stats");
    return response.data;
  },

  getCreditRequests: async (
    status = "PENDING"
  ): Promise<{ creditRequests: CreditRequest[] }> => {
    const response = await apiClient.get("/dashboard/credit-requests", {
      params: { status },
    });
    return response.data;
  },

  getRecentActivity: async (): Promise<{ activities: Activity[] }> => {
    const response = await apiClient.get("/dashboard/recent-activity");
    return response.data;
  },
};
