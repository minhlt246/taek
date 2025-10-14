"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { authApi } from "@/services/api/auth";
import ChangePassword from "@/app/(client)/(require-login)/user-center/profile/components/change-password";
import UpdateProfileModal from "@/app/(client)/(require-login)/user-center/profile/components/update-profile";
import AddPayment from "@/components/ui/crm/modals/add-payment";
import DeletePayment from "@/components/ui/crm/modals/delete-payment";
import Loading from "@/components/ui/loading";
import { useAccountStore } from "@/stores/account";
import { p2pApi } from "@/services/api/p2p";
import { useToast } from "@/utils/toast";
import { convertDate } from "@/utils/filters";
/**
 * Profile page displays current user's detailed information
 * Calls /user/detail API to get UserDetail based on token
 */

// Helper components to prevent hydration issues
const KycStatusDisplay = ({ kycStatus }: { kycStatus: string }) => {
  const handleNavigate = () => {
    window.location.href = "/user-center/kyc";
  };

  if (kycStatus === "PENDING") {
    return (
      <div className="d-flex align-items-center">
        <span className="text-warning" style={{ fontSize: "16px" }}>
          ⏳
        </span>
        <button
          onClick={handleNavigate}
          className="ms-2 text-warning fw-bold btn btn-link p-0"
        >
          Pending Review
        </button>
      </div>
    );
  }

  if (kycStatus === "APPROVED") {
    return (
      <div className="d-flex align-items-center">
        <span className="text-success" style={{ fontSize: "16px" }}>
          ✅
        </span>
        <span className="ms-2 text-success fw-bold">Verified</span>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="d-flex align-items-center">
        <span className="text-danger" style={{ fontSize: "16px" }}>
          ❌
        </span>
        <button
          onClick={handleNavigate}
          className="ms-2 text-danger fw-bold btn btn-link p-0"
        >
          Rejected - Resubmit
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center">
      <span className="text-secondary" style={{ fontSize: "16px" }}>
        ❌
      </span>
      <button
        onClick={handleNavigate}
        className="ms-2 text-primary fw-bold btn btn-link p-0"
      >
        Not Verified
      </button>
    </div>
  );
};

const AvatarDisplay = ({
  avatarUrl,
  email,
  getInitialAvatar,
}: {
  avatarUrl?: string;
  email: string;
  getInitialAvatar: (email: string) => string;
}) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="User Avatar" className="rounded-circle" />;
  }

  return (
    <div
      className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
      style={{
        width: "42px",
        height: "42px",
        backgroundColor: "#6c757d",
        fontSize: "14px",
      }}
    >
      {getInitialAvatar(email)}
    </div>
  );
};

export default function Profile() {
  // take user from context (can be used for quick display)
  const { account, setAccount, reset, loginSuccess } = useAccountStore();

  // Mock security status for KYC
  const kycStatus = account?.kycStatus || "pending";
  const securityLoading = false;
  const refreshSecurityStatus = async () => {};

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [myPaymentMethods, setMyPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isShowAddPaymentModal, setIsShowAddPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized function để convert file to Base64
  const toBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // Memoized function để lấy initial avatar
  const getInitialAvatar = useCallback((username: string): string => {
    return username ? username.charAt(0).toUpperCase() : "U";
  }, []);

  // Memoized function để fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const res: any = await p2pApi.getAllPaymentMethods();
      setPaymentMethods(res);
    } catch (error: any) {
      useToast.error("Failed to load payment methods");
      console.error("Error fetching payment methods:", error);
    }
  }, []);

  // Memoized function để fetch my payment methods
  const fetchMyPaymentMethods = useCallback(async () => {
    try {
      const res: any = await p2pApi.getPaymentMethods({});
      setMyPaymentMethods(res);
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
          // Update existing payment method
          paymentData.id = selectedPaymentMethod.id;
          await p2pApi.updatePaymentMethod(paymentData);
          useToast.success("Payment method updated successfully");
        } else {
          // Create new payment method
          await p2pApi.createPaymentMethod(paymentData);
          useToast.success("Payment method created successfully");
        }

        // Refresh payment methods
        await fetchMyPaymentMethods();
        setIsShowAddPaymentModal(false);
        setSelectedPaymentMethod(null);
      } catch (error: any) {
        useToast.error(error.message || "Failed to save payment method");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedPaymentMethod?.id, fetchMyPaymentMethods] // ✅ Remove toBase64 dependency
  );

  // Memoized function để handle delete payment
  const handleDeletePayment = useCallback(
    async (paymentId: string) => {
      try {
        setIsSubmitting(true);
        await p2pApi.deletePaymentMethod({ id: paymentId });
        useToast.success("Payment method deleted successfully");

        // Đóng modal và reload danh sách
        setShowDeleteConfirm(false);

        // Delay để đảm bảo modal đã đóng hoàn toàn
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

  // Initial data loading - chỉ gọi API payment methods
  // useSecurityStatus hook sẽ tự động fetch user detail và KYC status
  useEffect(() => {
    if (loginSuccess) {
      // Refresh security status when page loads
      refreshSecurityStatus();

      Promise.all([fetchPaymentMethods(), fetchMyPaymentMethods()]).catch(
        (error) => {
          console.error("Error loading payment methods:", error);
        }
      );
      // Set loading to false since useSecurityStatus will handle user data
      setLoading(false);
    }
  }, [
    loginSuccess,
    fetchPaymentMethods,
    fetchMyPaymentMethods,
    refreshSecurityStatus,
  ]);

  // Memoized computed values
  const hasPaymentMethods = useMemo(
    () => myPaymentMethods.length > 0,
    [myPaymentMethods.length]
  );

  // Show loading while security data is being fetched or component not mounted
  if (securityLoading || !account || !mounted) {
    return <Loading />;
  }

  return (
    <div
      className="container py-3 py-lg-5"
      key={`profile-container-${account.uid}`}
    >
      <ChangePassword key="change-password-modal" />
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
      <div className="profile" key="profile-main">
        <div className="profile-header mb-3" key="profile-header">
          <div className=" gap-3 ">
            <div className="profile-info d-flex align-items-center gap-3 ">
              <div
                className="avatar-container"
                key={`avatar-${account?.id || "default"}`}
              >
                <AvatarDisplay
                  avatarUrl={account?.avatarUrl}
                  email={account?.email || ""}
                  getInitialAvatar={getInitialAvatar}
                />
              </div>
              <div className="profile-info-header d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-2 box-user">
                  <h4 className="mb-1">Hi, {account?.email}</h4>
                  <div className="uid">UID: {account?.uid}</div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-profile">
                    Last Log-in: {convertDate(account?.lastLoginAt)}
                  </div>
                  {/* <div className="text-profile">
                    IP: {account?.lastLoginIp || "N/A"}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-content">
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-lg-9">
                  <div className="p-3">
                    <div className="fw-semibold">ID Verification</div>
                    <div className="mb-3 mb-lg-0">
                      <small style={{ fontSize: "12px", color: "#565656" }}>
                        Completing ID verification brings greater account
                        security, fewer limits on withdrawals, and more trading
                        permissions.
                      </small>
                    </div>
                    <div className="d-flex justify-content-start">
                      <a
                        className="text-primary fw-light text-link"
                        href="/user-center/kyc"
                      >
                        <span className="">Basic verification </span>
                      </a>

                      {/* <a
                          className="text-primary fw-light text-link"
                          href="/user-center/kyc"
                        >
                          <span className="ms-2">
                            Advanced Fiat Verification
                          </span>
                        </a> */}
                    </div>
                  </div>
                  {/* <a href="/user-center/two-fa" className="text-primary">
                      Setup 2FA
                    </a> */}
                </div>
                <div className="col-lg-3 px-lg-4">
                  <img src="/images/verify-icon.png" alt="ID Verification" />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">
              <div className="">
                <i className="fa-solid fa-user"></i>
                <span className="ms-2 text-nev">Information</span>
              </div>
            </div>
            <div className="card-body">
              <div className="row border-bottom mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">Full Name</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For change of security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <small className="text-muted">
                    {account?.firstName} {account?.lastName}
                  </small>
                </div>
              </div>
              <div className="row border-bottom mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">Email</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For login, withdrawals, password retrieval, change of
                      security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <small className="text-muted">{account?.email}</small>
                </div>
              </div>
              <div className="row border-bottom mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">Phone</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For login, withdrawals, password retrieval, change of
                      security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <small className="text-muted">{account?.phoneNumber}</small>
                </div>
              </div>
              <div className="row mx-0 pt-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">Address</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For change of security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <small className="text-muted">{account?.address}</small>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary text-profiles"
                  data-bs-toggle="modal"
                  data-bs-target="#updateProfile"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-header">
              <div className="text-nev">
                <i className="fa-solid fa-shield-keyhole"></i>
                <span className="ms-2">Security</span>
              </div>
            </div>
            <div className="card-body pb-0">
              <div className="row border-bottom mx-0 pb-2">
                <div className="col-lg-6">
                  <div>
                    <div className="text-nev">
                      Security Level:
                      <span className="text-warning ms-2">Standard</span>
                    </div>
                    <div className="text-muted mb-0 mb-lg-3">
                      <small>
                        Standard security level with password protection.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row border-bottom mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">Two-factor Authentication</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For login, withdrawals, password retrieval, change of
                      security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <div className="text-muted">
                    <span style={{ fontSize: "16px" }}>❌</span>
                    <span className="ms-2">Not available</span>
                  </div>
                </div>
              </div>
              <div className="row mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="text-nev">KYC Verification</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      For login, withdrawals, password retrieval, change of
                      security settings and API management.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <KycStatusDisplay kycStatus={kycStatus || ""} />
                </div>
              </div>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-header">
              <div className="text-nev">
                <i className="fa-solid fa-lock-keyhole"></i>
                <span className="ms-2">Password Management</span>
              </div>
            </div>
            <div className="card-body pb-0">
              <div className="row mx-0 py-2 align-items-center">
                <div className="col-8 col-lg-6">
                  <div className="text-nev">Password</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>To ensure account security</small>
                  </div>
                </div>
                <div className="col-4 col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <div className="text-muted">********</div>
                  <a
                    href="#changePasswordModal"
                    className="text-primary ms-3"
                    data-bs-toggle="modal"
                  >
                    Change
                  </a>
                </div>
              </div>
              {/* <div className="row mx-0 py-2 align-items-center">
                <div className="col-lg-6">
                  <div className="fw-bold">Anti-phishing Code</div>
                  <div className="text-muted mb-0 mb-lg-3">
                    <small>
                      The email sent to you by MUS will contain the
                      anti-phishing code to be distinct from fake mail.
                    </small>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end align-items-center">
                  <div className="text-muted">{account?.email}</div>
                  <a href="#" className="text-primary ms-3">
                    Change
                  </a>
                </div>
              </div> */}
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="text-nev">
                <i className="fa-solid fa-credit-card"></i>
                <span className="ms-2">Payment Method</span>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleAddNewPayment}
              >
                <i className="fa-solid fa-plus"></i>
                <span className=" text-profiles">Add Payment</span>
              </button>
            </div>
            <div className="card-body">
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
                            {convertDate(pm.createdAt)}
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
                              style={{ maxWidth: "150px", maxHeight: "150px" }}
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
                  <h5 className="text-muted mt-3">No Payment Methods</h5>
                  <p className="text-muted">
                    You haven&apos;t added any payment methods yet.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddNewPayment}
                  >
                    <i className="fa-solid fa-plus me-2" />
                    Add Your First Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
