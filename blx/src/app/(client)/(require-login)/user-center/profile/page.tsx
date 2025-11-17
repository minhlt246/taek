"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import UpdateProfileModal from "@/app/(client)/(require-login)/user-center/profile/components/update-profile";
import AddPayment from "@/components/ui/crm/modals/add-payment";
import DeletePayment from "@/components/ui/crm/modals/delete-payment";
import Loading from "@/components/ui/loading";
import { useAccountStore } from "@/stores/account";
import { useToast } from "@/utils/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
/**
 * Profile page displays current user's detailed information
 * Uses HTML structure from office.html with sidebar layout
 */

// Helper function to format date
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};


export default function Profile() {
  const router = useRouter();
  const { account, logout, loginSuccess } = useAccountStore();

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [myPaymentMethods, setMyPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isShowAddPaymentModal, setIsShowAddPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle avatar preview
  useEffect(() => {
    if (account?.avatarUrl) {
      setAvatarPreview(account.avatarUrl);
    }
  }, [account?.avatarUrl]);

  // Memoized function để fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethods([]);
    } catch (error: any) {
      useToast.error("Failed to load payment methods");
      console.error("Error fetching payment methods:", error);
    }
  }, []);

  // Memoized function để fetch my payment methods
  const fetchMyPaymentMethods = useCallback(async () => {
    try {
      setMyPaymentMethods([]);
    } catch (error: any) {
      useToast.error("Failed to load your payment methods");
      console.error("Error fetching my payment methods:", error);
    }
  }, []);

  // Memoized function để handle add/update payment
  const handleAddPayment = useCallback(
    async (
      paymentMethod: any,
      accountName: any,
      accountNumber: any,
      providerName: any,
      qrCodeUrl: string,
      instructions: string = ""
    ) => {
      try {
        setIsSubmitting(true);
        const paymentData: any = {
          method: paymentMethod,
          providerName: providerName,
          accountNumber: accountNumber,
          accountName: accountName,
          instructions: instructions,
          qrCodeUrl: qrCodeUrl,
          isActive: true,
        };

        if (selectedPaymentMethod?.id) {
          useToast.success("Payment method updated successfully");
        } else {
          useToast.success("Payment method created successfully");
        }

        await fetchMyPaymentMethods();
        setIsShowAddPaymentModal(false);
        setSelectedPaymentMethod(null);
      } catch (error: any) {
        useToast.error(error.message || "Failed to save payment method");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedPaymentMethod?.id, fetchMyPaymentMethods]
  );

  // Memoized function để handle delete payment
  const handleDeletePayment = useCallback(
    async (paymentId: string) => {
      try {
        setIsSubmitting(true);
        useToast.success("Payment method deleted successfully");
        setShowDeleteConfirm(false);
        setTimeout(async () => {
          await fetchMyPaymentMethods();
        }, 300);
      } catch (error: any) {
        useToast.error(error.message || "Failed to delete payment method");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchMyPaymentMethods]
  );

  // Memoized function để confirm delete payment
  const confirmDeletePayment = useCallback((payment: any) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirm(true);
  }, []);

  // Memoized function để handle modal close
  const handleCloseAddModal = useCallback(() => {
    setIsShowAddPaymentModal(false);
    setSelectedPaymentMethod(null);
  }, []);

  // Memoized function để handle close delete modal
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirm(false);
    setPaymentToDelete(null);
  }, []);

  // Memoized function để handle edit payment
  const handleEditPayment = useCallback((payment: any) => {
    setSelectedPaymentMethod(payment);
    setIsShowAddPaymentModal(true);
  }, []);

  // Memoized function để handle add new payment
  const handleAddNewPayment = useCallback(() => {
    setSelectedPaymentMethod(null);
    setIsShowAddPaymentModal(true);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  // Handle avatar file change
  const handleAvatarFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        // Trigger update profile modal
        const updateProfileBtn = document.querySelector(
          '[data-bs-target="#updateProfile"]'
        ) as HTMLElement;
        if (updateProfileBtn) {
          updateProfileBtn.click();
        }
      }
    },
    []
  );

  // Initial data loading
  useEffect(() => {
    if (loginSuccess) {
      Promise.all([fetchPaymentMethods(), fetchMyPaymentMethods()]).catch(
        (error) => {
          console.error("Error loading payment methods:", error);
        }
      );
      setLoading(false);
    }
  }, [loginSuccess, fetchPaymentMethods, fetchMyPaymentMethods]);

  // Memoized computed values
  const hasPaymentMethods = useMemo(
    () => myPaymentMethods.length > 0,
    [myPaymentMethods.length]
  );

  // Get initial avatar
  const getInitialAvatar = useCallback((email: string): string => {
    return email ? email.charAt(0).toUpperCase() : "U";
  }, []);

  // Show loading while component not mounted or account not loaded
  if (!account || !mounted) {
    return <Loading />;
  }

  return (
    <div className="container office-layout-wrapper">
      <UpdateProfileModal key="update-profile-modal" />
      <AddPayment
        key="add-payment-modal"
        paymentMethods={paymentMethods}
        updatePaymentMethod={selectedPaymentMethod}
        isOpen={isShowAddPaymentModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddPayment}
        isSubmitting={isSubmitting}
      />
      <DeletePayment
        key="delete-payment-modal"
        paymentToDelete={paymentToDelete}
        isOpen={showDeleteConfirm}
        onClose={handleCloseDeleteModal}
        onSubmit={handleDeletePayment}
        isSubmitting={isSubmitting}
      />

      {/* Desktop Sidebar */}
      <div className="office-sidebar d-none d-lg-block">
        <ul className="office-menu list-unstyled nav flex-column nav-pills">
          <li className="nav-item">
            <Link
              href="/user-center/profile"
              className="office-menu-link nav-link active"
            >
              <i className="fas fa-user-circle me-2"></i>
              Tài khoản
            </Link>
          </li>
          <li className="nav-item">
            <button
              className="office-menu-link nav-link"
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                width: "100%",
                textAlign: "left",
              }}
            >
              <i className="fas fa-right-from-bracket me-2"></i>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="office-mobile-toggle d-lg-none">
        <button
          className="btn btn-outline-light"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Mobile Sidebar (offcanvas) */}
      <div
        className="offcanvas offcanvas-start d-lg-none"
        id="mobileSidebar"
        tabIndex={-1}
        aria-labelledby="mobileSidebarLabel"
      >
        <div className="offcanvas-header">
          <h6 className="offcanvas-title" id="mobileSidebarLabel">
            Menu
          </h6>
          <button
            className="btn-close text-reset"
            type="button"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="office-menu list-unstyled nav flex-column">
            <li className="nav-item">
              <Link
                href="/user-center/profile"
                className="office-menu-link nav-link active"
                data-bs-dismiss="offcanvas"
              >
                <i className="fas fa-user-circle me-2"></i>
                Tài khoản
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="office-menu-link nav-link"
                onClick={() => {
                  const offcanvasElement = document.getElementById("mobileSidebar");
                  if (offcanvasElement) {
                    const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(
                      offcanvasElement
                    );
                    if (bsOffcanvas) {
                      bsOffcanvas.hide();
                    }
                  }
                  handleLogout();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <i className="fas fa-right-from-bracket me-2"></i>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <section className="office-content-wrapper">
        <div className="office">
          <div className="office-main-wrapper container mt-5 mt-lg-0">
            <div className="office-main">
              <h3 className="office-title px-2">THÔNG TIN HỒ SƠ</h3>
              <div className="row g-4 mx-0 mt-1">
                {/* Avatar Upload Section */}
                <div className="col-lg-4 col-md-5">
                  <div className="office-card text-center">
                    <div className="office-card-tiltle">
                      <span>1. Thay đổi ảnh đại diện</span>
                    </div>
                    <div className="office-avatar">
                      {avatarPreview || account?.avatarUrl ? (
                        <img
                          className="office-avatar-img"
                          src={avatarPreview || account?.avatarUrl || ""}
                          alt="Avatar"
                        />
                      ) : (
                        <div
                          className="office-avatar-img d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            fontSize: "48px",
                            fontWeight: "bold",
                          }}
                        >
                          {getInitialAvatar(account?.email || "")}
                        </div>
                      )}
                    </div>
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarFileChange}
                    />
                    <label
                      className="btn btn-outline-upload mt-3"
                      htmlFor="avatarFile"
                      style={{ cursor: "pointer" }}
                    >
                      Chọn Ảnh
                    </label>
                    <p className="mt-3 mb-0 small">Dung lượng file tối đa 1 MB</p>
                    <p className="mt-1 small">Định dạng: JPEG, PNG</p>
                    <button
                      className="btn office-submit mt-3"
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#updateProfile"
                      style={{ width: "auto", margin: "10px auto 0" }}
                    >
                      Cập nhật ảnh đại diện
                    </button>
                  </div>
                </div>

                {/* Profile Information Form */}
                <div className="col-lg-8 col-md-7">
                  <div className="office-card">
                    <div className="office-card-tiltle">
                      <span>2. Thông tin cơ bản</span>
                </div>
                    <form>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="fullName">
                          Họ & Tên
                        </label>
                        <input
                          className="form-control form-office-card"
                          id="fullName"
                          type="text"
                          placeholder="Nhập họ tên"
                          value={`${account?.firstName || ""} ${account?.lastName || ""}`}
                          readOnly
                        />
              </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="email">
                          Email
                        </label>
                        <input
                          className="form-control form-office-card"
                          id="email"
                          type="email"
                          placeholder="Nhập email"
                          value={account?.email || ""}
                          readOnly
                        />
                  </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="phone">
                          Điện thoại
                        </label>
                        <input
                          className="form-control form-office-card"
                          id="phone"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={account?.phoneNumber || ""}
                          readOnly
                        />
                </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="address">
                          Địa chỉ
                        </label>
                        <input
                          className="form-control form-office-card"
                          id="address"
                          type="text"
                          placeholder="Nhập địa chỉ"
                          value={account?.address || ""}
                          readOnly
                        />
                </div>
                      <div className="d-grid">
                <button
                          className="btn office-submit"
                          type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#updateProfile"
                >
                          CẬP NHẬT
                </button>
              </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Additional Information Cards */}
              <div className="row g-4 mx-0 mt-3">
                {/* Payment Methods Card */}
                <div className="col-12">
                  <div className="office-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="office-card-tiltle mb-0">
                        <span>3. Phương thức thanh toán</span>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleAddNewPayment}
              >
                <i className="fa-solid fa-plus"></i>
                        <span className="ms-1">Thêm</span>
              </button>
            </div>
                    <div>
              {hasPaymentMethods ? (
                myPaymentMethods.map((pm) => (
                  <div className="card mb-3" key={pm.id}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <i className="fa-solid fa-credit-card text-primary" />
                        </div>
                        <div className="payment-method-info">
                          <div className="fw-bold text-capitalize">
                            {pm.method}
                          </div>
                          <small className="text-muted">
                            {pm.isActive ? (
                              <span className="text-success">
                                <i className="fa-solid fa-circle-check me-1" />
                                Active
                              </span>
                            ) : (
                              <span className="text-secondary">
                                <i className="fa-solid fa-circle-xmark me-1" />
                                Inactive
                              </span>
                            )}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditPayment(pm)}
                          title="Edit payment method"
                        >
                          <i className="fa-solid fa-pencil" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDeletePayment(pm)}
                          title="Delete payment method"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-3 mb-3">
                          <div className="text-muted small">Account Name</div>
                          <div className="fw-bold">{pm.accountName}</div>
                        </div>
                        <div className="col-lg-3 mb-3">
                          <div className="text-muted small">Account Number</div>
                          <div className="fw-bold font-monospace">
                            {pm.accountNumber}
                          </div>
                        </div>
                        <div className="col-lg-3 mb-3">
                          <div className="text-muted small">Provider</div>
                          <div className="fw-bold">{pm.providerName}</div>
                        </div>
                        <div className="col-lg-3 mb-3">
                          <div className="text-muted small">Created</div>
                          <div className="fw-bold">
                            {formatDate(pm.createdAt)}
                          </div>
                        </div>
                      </div>
                      {pm.instructions && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="text-muted small">Instructions</div>
                            <div className="bg-light p-2 rounded">
                              {pm.instructions}
                            </div>
                          </div>
                        </div>
                      )}
                      {pm.qrCodeUrl && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="text-muted small">QR Code</div>
                            <img
                              src={pm.qrCodeUrl}
                              alt="QR Code"
                                      style={{
                                        maxWidth: "150px",
                                        maxHeight: "150px",
                                      }}
                              className="border rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i
                    className="fa-solid fa-credit-card text-muted"
                    style={{ fontSize: "3rem" }}
                  />
                          <h5 className="text-muted mt-3">
                            Chưa có phương thức thanh toán
                          </h5>
                  <p className="text-muted">
                            Bạn chưa thêm phương thức thanh toán nào.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddNewPayment}
                  >
                    <i className="fa-solid fa-plus me-2" />
                            Thêm phương thức thanh toán đầu tiên
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

