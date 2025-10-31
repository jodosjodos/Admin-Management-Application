import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import apiClient from "../services/api";
import "../styles/Credits.css";

interface CreditRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  creditScore: number;
  repaymentPeriod: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export const CreditsPage = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "PENDING" | "APPROVED" | "REJECTED"
  >("all");

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        filter === "all"
          ? "/dashboard/credit-requests"
          : `/dashboard/credit-requests?status=${filter}`;
      const response = await apiClient.get(endpoint);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Failed to load credit requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm("Are you sure you want to approve this credit request?"))
      return;

    try {
      await apiClient.post(`/credit-requests/${requestId}/approve`);
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "APPROVED" as const } : r
        )
      );
    } catch (error) {
      alert("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm("Are you sure you want to reject this credit request?"))
      return;

    try {
      await apiClient.post(`/credit-requests/${requestId}/reject`);
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "REJECTED" as const } : r
        )
      );
    } catch (error) {
      alert("Failed to reject request");
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 700) return "excellent";
    if (score >= 600) return "good";
    if (score >= 500) return "fair";
    return "poor";
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading credit requests...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="credits-container">
        <div className="credits-header">
          <h1>Credit Requests</h1>

          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={filter === "PENDING" ? "active" : ""}
              onClick={() => setFilter("PENDING")}
            >
              Pending
            </button>
            <button
              className={filter === "APPROVED" ? "active" : ""}
              onClick={() => setFilter("APPROVED")}
            >
              Approved
            </button>
            <button
              className={filter === "REJECTED" ? "active" : ""}
              onClick={() => setFilter("REJECTED")}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="credits-grid">
          {filteredRequests.map((request) => (
            <div key={request.id} className="credit-card">
              <div className="credit-card-header">
                <h3>{request.userName}</h3>
                <span
                  className={`status-badge ${request.status.toLowerCase()}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="credit-details">
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">
                    KES {request.amount.toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Credit Score:</span>
                  <span
                    className={`value score-${getScoreColor(
                      request.creditScore
                    )}`}
                  >
                    {request.creditScore}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Repayment Period:</span>
                  <span className="value">
                    {request.repaymentPeriod} months
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Purpose:</span>
                  <span className="value">{request.purpose}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span className="value">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {request.status === "PENDING" && (
                <div className="credit-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <p className="no-data">No credit requests found</p>
        )}
      </div>
    </Layout>
  );
};
