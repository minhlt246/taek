"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface Payment {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const { account } = useAccountStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all");

  useEffect(() => {
    // Simulate API call to fetch payments
    const fetchPayments = async () => {
      setLoading(true);
      // TODO: Replace with actual API calls
      setTimeout(() => {
        setPayments([
          {
            id: 1,
            user_name: "Nguyễn Văn A",
            user_email: "nguyenvana@example.com",
            amount: 500000,
            payment_method: "Bank Transfer",
            status: "completed",
            description: "Monthly tuition fee - January 2024",
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:35:00Z"
          },
          {
            id: 2,
            user_name: "Trần Thị B",
            user_email: "tranthib@example.com",
            amount: 300000,
            payment_method: "Cash",
            status: "completed",
            description: "Belt test fee",
            created_at: "2024-01-16T14:20:00Z",
            updated_at: "2024-01-16T14:20:00Z"
          },
          {
            id: 3,
            user_name: "Lê Văn C",
            user_email: "levanc@example.com",
            amount: 500000,
            payment_method: "Credit Card",
            status: "pending",
            description: "Monthly tuition fee - February 2024",
            created_at: "2024-01-17T09:15:00Z",
            updated_at: "2024-01-17T09:15:00Z"
          },
          {
            id: 4,
            user_name: "Phạm Thị D",
            user_email: "phamthid@example.com",
            amount: 200000,
            payment_method: "Bank Transfer",
            status: "failed",
            description: "Equipment fee",
            created_at: "2024-01-18T16:45:00Z",
            updated_at: "2024-01-18T16:50:00Z"
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'failed': return 'bg-danger';
      case 'refunded': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Payment Management</h2>
        <p>Manage all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(payments.reduce((sum, payment) => 
                      payment.status === 'completed' ? sum + payment.amount : sum, 0
                    ))}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Payments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {payments.filter(p => p.status === 'pending').length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Failed Payments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {payments.filter(p => p.status === 'failed').length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Transactions
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {payments.length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-credit-card fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Payment Transactions</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "completed" | "failed" | "refunded")}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>
                      <div>
                        <div className="font-weight-bold">{payment.user_name}</div>
                        <small className="text-muted">{payment.user_email}</small>
                      </div>
                    </td>
                    <td className="font-weight-bold">{formatCurrency(payment.amount)}</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                        {getStatusDisplayName(payment.status)}
                      </span>
                    </td>
                    <td>{payment.description}</td>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-eye"></i>
                        </button>
                        {payment.status === 'pending' && (
                          <button className="btn btn-sm btn-outline-success">
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        {payment.status === 'completed' && (
                          <button className="btn btn-sm btn-outline-warning">
                            <i className="fas fa-undo"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
              <p className="text-muted">No payments found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
