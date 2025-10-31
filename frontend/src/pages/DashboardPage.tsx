import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import type {
  DashboardStats,
  CreditRequest,
  Activity,
} from "../services/dashboardService";
import { Layout } from "../components/Layout";
import "../styles/Dashboard.css";

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingCredits, setPendingCredits] = useState<CreditRequest[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, creditsData, activitiesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCreditRequests("PENDING"),
        dashboardService.getRecentActivity(),
      ]);
      setStats(statsData.stats);
      setPendingCredits(creditsData.creditRequests);
      setActivities(activitiesData.activities);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadDashboard} className="btn btn-primary">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-value">
                {stats?.users.total.toLocaleString()}
              </div>
              <div className="stat-details">
                <span className="positive">Active: {stats?.users.active}</span>
                <span>New: {stats?.users.newThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Savings</h3>
              <div className="stat-value">
                {stats?.savings.totalBalance.toLocaleString()} RWF
              </div>
              <div className="stat-details">
                <span>Accounts: {stats?.savings.totalAccounts}</span>
                <span className="positive">
                  +{stats?.growth.savingsGrowth}%
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>Credit Requests</h3>
              <div className="stat-value">{stats?.credit.totalRequests}</div>
              <div className="stat-details">
                <span className="warning">
                  Pending: {stats?.credit.pending}
                </span>
                <span className="positive">
                  Approved: {stats?.credit.approved}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Transactions</h3>
              <div className="stat-value">
                {stats?.transactions.total.toLocaleString()}
              </div>
              <div className="stat-details">
                <span>This Month: {stats?.transactions.thisMonth}</span>
                <span className="positive">
                  {(stats?.transactions.volume ?? 0).toLocaleString()} RWF
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Pending Credit Requests */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Pending Credit Requests</h2>
              <Link to="/credits" className="btn btn-link">
                View All
              </Link>
            </div>
            {pendingCredits.length > 0 ? (
              <div className="credit-list">
                {pendingCredits.slice(0, 5).map((credit) => (
                  <div key={credit.id} className="credit-item">
                    <div className="credit-info">
                      <strong>
                        {credit.user.firstName} {credit.user.lastName}
                      </strong>
                      <span className="amount">
                        {credit.amount.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="credit-meta">
                      <span>Score: {credit.creditScore}</span>
                      <span>{credit.repaymentPeriod} days</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No pending credit requests</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            {activities.length > 0 ? (
              <div className="activity-list">
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === "USER_REGISTRATION" && "👤"}
                      {activity.type === "CREDIT_REQUEST" && "💳"}
                      {activity.type === "DEPOSIT" && "⬇️"}
                      {activity.type === "WITHDRAWAL" && "⬆️"}
                    </div>
                    <div className="activity-content">
                      <p>{activity.description}</p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
