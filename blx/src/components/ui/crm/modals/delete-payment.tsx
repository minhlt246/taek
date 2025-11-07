"use client";

interface DeletePaymentProps {
  paymentToDelete: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentId: string) => void;
  isSubmitting: boolean;
}

export default function DeletePayment({
  paymentToDelete,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: DeletePaymentProps) {
  const handleConfirm = () => {
    if (paymentToDelete?.id) {
      onSubmit(paymentToDelete.id);
    }
  };

  if (!isOpen || !paymentToDelete) return null;

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
            <h5 className="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa phương thức thanh toán{" "}
              <strong>
                {paymentToDelete.providerName} - {paymentToDelete.accountNumber}
              </strong>
              ?
            </p>
            <p className="text-danger">
              <small>Hành động này không thể hoàn tác.</small>
            </p>
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
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
}

