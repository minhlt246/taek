"use client";

import { useState, useEffect } from "react";

interface AddPaymentProps {
  paymentMethods: any[];
  updatePaymentMethod?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    paymentMethod: any,
    accountName: any,
    accountNumber: any,
    providerName: any,
    qrCodeUrl: string,
    instructions?: string
  ) => void;
  isSubmitting: boolean;
}

export default function AddPayment({
  paymentMethods,
  updatePaymentMethod,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddPaymentProps) {
  const [formData, setFormData] = useState({
    paymentMethod: "",
    accountName: "",
    accountNumber: "",
    providerName: "",
    qrCodeUrl: "",
    instructions: "",
  });

  useEffect(() => {
    if (updatePaymentMethod) {
      setFormData({
        paymentMethod: updatePaymentMethod.method || "",
        accountName: updatePaymentMethod.accountName || "",
        accountNumber: updatePaymentMethod.accountNumber || "",
        providerName: updatePaymentMethod.providerName || "",
        qrCodeUrl: updatePaymentMethod.qrCodeUrl || "",
        instructions: updatePaymentMethod.instructions || "",
      });
    } else {
      setFormData({
        paymentMethod: "",
        accountName: "",
        accountNumber: "",
        providerName: "",
        qrCodeUrl: "",
        instructions: "",
      });
    }
  }, [updatePaymentMethod, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      formData.paymentMethod,
      formData.accountName,
      formData.accountNumber,
      formData.providerName,
      formData.qrCodeUrl,
      formData.instructions
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block" }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {updatePaymentMethod ? "Cập nhật" : "Thêm"} phương thức thanh toán
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Phương thức thanh toán</label>
                <select
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn phương thức</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tên ngân hàng/Nhà cung cấp</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.providerName}
                  onChange={(e) =>
                    setFormData({ ...formData, providerName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tên chủ tài khoản</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Số tài khoản</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">QR Code URL (tùy chọn)</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.qrCodeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, qrCodeUrl: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Hướng dẫn (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
}

