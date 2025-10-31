import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import apiClient from "../services/api";
import "../styles/Transactions.css";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "CREDIT_DISBURSEMENT" | "CREDIT_REPAYMENT";
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params = typeFilter !== "all" ? `?type=${typeFilter}` : "";
      const response = await apiClient.get(`/transactions${params}`);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "DEPOSIT":
      case "CREDIT_REPAYMENT":
        return "success";
      case "WITHDRAWAL":
        return "warning";
      case "CREDIT_DISBURSEMENT":
        return "info";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "DEPOSIT":
        return "⬇️";
      case "WITHDRAWAL":
        return "⬆️";
      case "CREDIT_DISBURSEMENT":
        return "💰";
      case "CREDIT_REPAYMENT":
        return "💳";
      default:
        return "💸";
    }
  };

  const formatType = (type: string): string => {
    return type.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Platform Transactions</h1>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="CREDIT_DISBURSEMENT">Credit Disbursements</option>
            <option value="CREDIT_REPAYMENT">Credit Repayments</option>
          </select>
        </div>

        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span
                      className={`type-badge ${getTypeColor(transaction.type)}`}
                    >
                      {getTypeIcon(transaction.type)}{" "}
                      {formatType(transaction.type)}
                    </span>
                  </td>
                  <td>
                    <strong>{transaction.userName}</strong>
                  </td>
                  <td
                    className={
                      transaction.type === "WITHDRAWAL"
                        ? "amount-negative"
                        : "amount-positive"
                    }
                  >
                    {transaction.type === "WITHDRAWAL" ? "-" : "+"}KES{" "}
                    {transaction.amount.toLocaleString()}
                  </td>
                  <td>KES {transaction.balanceAfter.toLocaleString()}</td>
                  <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <p className="no-data">No transactions found</p>
          )}
        </div>
      </div>
    </Layout>
  );
};
