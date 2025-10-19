"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface Payment {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const { account } = useAccountStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed" | "refunded"
  >("all");

  useEffect(() => {
    // Lấy danh sách thanh toán từ API
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/payments');
        // setPayments(response.data);
        setPayments([]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách thanh toán:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "failed":
        return "bg-danger";
      case "refunded":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang chờ";
      case "failed":
        return "Thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Quản lý thanh toán</h2>
        <p>Quản lý tất cả giao dịch thanh toán</p>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Tổng doanh thu
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(
                      payments.reduce(
                        (sum, payment) =>
                          payment.status === "completed"
                            ? sum + payment.amount
                            : sum,
                        0
                      )
                    )}
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
                    Thanh toán đang chờ
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {payments.filter((p) => p.status === "pending").length}
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
                    Thanh toán thất bại
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {payments.filter((p) => p.status === "failed").length}
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
                    Tổng giao dịch
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
          <h6 className="m-0 font-weight-bold text-primary">
            Giao dịch thanh toán
          </h6>
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
                  placeholder="Tìm kiếm thanh toán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "completed"
                      | "failed"
                      | "refunded"
                  )
                }
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Đang chờ</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>
                      <div>
                        <div className="font-weight-bold">
                          {payment.user_name}
                        </div>
                        <small className="text-muted">
                          {payment.user_email}
                        </small>
                      </div>
                    </td>
                    <td className="font-weight-bold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          payment.status
                        )}`}
                      >
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
                        {payment.status === "pending" && (
                          <button className="btn btn-sm btn-outline-success">
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        {payment.status === "completed" && (
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
              <p className="text-muted">
                Không tìm thấy thanh toán nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
