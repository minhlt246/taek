"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import UpdateProfileModal from "@/app/(client)/(require-login)/user-center/profile/components/update-profile";
import AddPayment from "@/components/ui/crm/modals/add-payment";
import DeletePayment from "@/components/ui/crm/modals/delete-payment";
import Loading from "@/components/ui/loading";
import { useAccountStore } from "@/stores/account";
import { useToast } from "@/utils/toast";
import {
  profileApi,
  ProfileData,
  BeltHistory,
  Achievement,
  AttendanceRecord,
  Certificate,
} from "@/services/api/profile";
import { Enrollment } from "@/services/api/enrollments";
/**
 * Profile page displays current user's detailed information
 * Uses Next.js standard layout with sidebar
 */

// Helper function to format date
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatted && formatted !== "Invalid Date" ? formatted : "N/A";
  } catch (error) {
    return "N/A";
  }
};

export default function Profile() {
  const { account, loginSuccess } = useAccountStore();

  const [mounted, setMounted] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [myPaymentMethods, setMyPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isShowAddPaymentModal, setIsShowAddPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [beltHistory, setBeltHistory] = useState<BeltHistory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle avatar preview
  useEffect(() => {
    if ((account as any)?.avatarUrl) {
      setAvatarPreview((account as any).avatarUrl);
    }
  }, [(account as any)?.avatarUrl]);

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
      _paymentMethod: any,
      _accountName: any,
      _accountNumber: any,
      _providerName: any,
      _qrCodeUrl: string,
      _instructions: string = ""
    ) => {
      try {
        setIsSubmitting(true);
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
    async (_paymentId: string) => {
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

  // Handle avatar upload directly
  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      // Get token and account info from account store
      const { token, account, updateUser } = useAccountStore.getState();

      // Create FormData with userId and role
      const avatarFormData = new FormData();
      avatarFormData.append("image", file);
      if (account?.id) {
        avatarFormData.append("userId", String(account.id));
      }
      if (account?.role) {
        avatarFormData.append("role", account.role);
      }

      // Use usersApi directly to upload avatar
      const { usersApi } = await import("@/services/api/users");
      const uploadResponse = await usersApi.updateProfileWithAvatar(
        avatarFormData,
        token || undefined
      );

      if (uploadResponse.success && uploadResponse.data) {
        // Backend trả về avatar, profile_image_url, hoặc photo_url
        let avatarUrl =
          uploadResponse.data.avatarUrl ||
          uploadResponse.data.avatar ||
          uploadResponse.data.profile_image_url ||
          uploadResponse.data.photo_url;

        if (avatarUrl) {
          // Convert relative path thành full URL nếu cần
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          if (avatarUrl.startsWith("client/images/")) {
            avatarUrl = `${apiUrl}/${avatarUrl}`;
          } else if (avatarUrl.startsWith("/uploads/")) {
            avatarUrl = `${apiUrl}${avatarUrl}`;
          } else if (
            !avatarUrl.startsWith("http") &&
            !avatarUrl.startsWith("/")
          ) {
            avatarUrl = `${apiUrl}/${avatarUrl}`;
          }

          // Update account store with new avatar URL
          updateUser({ avatarUrl: avatarUrl } as any);
          useToast.success("Cập nhật ảnh đại diện thành công!");

          // Refresh profile data từ database để đảm bảo đồng bộ
          // Sử dụng event để trigger refresh (fetchProfileData sẽ lắng nghe event này)
          window.dispatchEvent(new Event("profileUpdated"));

          // Update preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          throw new Error("Không nhận được URL ảnh đại diện từ server");
        }
      } else {
        throw new Error(uploadResponse.message || "Upload ảnh thất bại");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể upload ảnh đại diện";
      useToast.error(errorMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle avatar file change
  const handleAvatarFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (max 1MB)
        const maxSize = 1 * 1024 * 1024; // 1MB
        if (file.size > maxSize) {
          useToast.error("Dung lượng file không được vượt quá 1 MB");
          return;
        }

        // Validate file type
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          useToast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)");
          return;
        }

        // Upload avatar directly
        handleAvatarUpload(file);

        // Reset input
        if (e.target) {
          e.target.value = "";
        }
      }
    },
    [handleAvatarUpload]
  );

  // Handle open update profile modal
  const handleOpenUpdateProfile = useCallback(() => {
    setIsUpdateProfileModalOpen(true);
  }, []);

  // Handle close update profile modal
  const handleCloseUpdateProfileModal = useCallback(() => {
    setIsUpdateProfileModalOpen(false);
    setSelectedAvatarFile(null);
  }, []);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Handle smooth scroll to section
  const handleScrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  }, []);

  // Handle scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero",
        "martial-arts",
        "progress",
        "schedule",
        "certificates",
        "attendance",
      ];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const offsetTop = section.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoadingProfile(true);

      // Fetch user data để lấy created_at và ma_hoi_vien
      const { usersApi } = await import("@/services/api/users");
      const user = await usersApi.getProfile();
      if (user) {
        // Xử lý ma_hoi_vien: chỉ loại bỏ NaN và giá trị không hợp lệ, giữ lại tất cả giá trị hợp lệ
        let validatedMaHoiVien: string | null = user.ma_hoi_vien ?? null;
        if (user.ma_hoi_vien !== null && user.ma_hoi_vien !== undefined) {
          // Kiểm tra nếu là NaN (number) - loại bỏ
          if (
            typeof user.ma_hoi_vien === "number" &&
            Number.isNaN(user.ma_hoi_vien)
          ) {
            validatedMaHoiVien = null;
          } else {
            // Convert sang string và kiểm tra chuỗi không hợp lệ
            const maHoiVienStr = String(user.ma_hoi_vien).trim();
            // Chỉ loại bỏ nếu là chuỗi "NaN", "null", "undefined" hoặc rỗng
            if (
              maHoiVienStr === "" ||
              maHoiVienStr === "NaN" ||
              maHoiVienStr === "null" ||
              maHoiVienStr === "undefined"
            ) {
              validatedMaHoiVien = null;
            } else {
              // Giữ lại giá trị gốc (có thể là số hoặc chuỗi)
              validatedMaHoiVien = user.ma_hoi_vien;
            }
          }
        }
        const validatedUser = {
          ...user,
          ma_hoi_vien: validatedMaHoiVien,
        };
        setUserData(validatedUser);
        if (user.created_at) {
          setUserCreatedAt(user.created_at);
        }
      }

      const data = await profileApi.getProfileData();

      // Validate and set profile data
      if (data.profileData) {
        // Ensure all fields are valid strings, not NaN or null/undefined
        const validatedProfile: ProfileData = {
          name: data.profileData.name
            ? String(data.profileData.name)
            : "Chưa có tên",
          username: data.profileData.username
            ? String(data.profileData.username)
            : "N/A",
          memberId:
            data.profileData.memberId &&
            data.profileData.memberId !== "NaN" &&
            data.profileData.memberId.trim() !== ""
              ? String(data.profileData.memberId).replace(/NaN/g, "N/A").trim()
              : "N/A",
          beltLevel: data.profileData.beltLevel
            ? String(data.profileData.beltLevel)
            : "Chưa có",
          beltColor: data.profileData.beltColor
            ? String(data.profileData.beltColor)
            : "#808080",
          yearsTraining:
            data.profileData.yearsTraining &&
            data.profileData.yearsTraining !== "NaN"
              ? String(data.profileData.yearsTraining).replace(/NaN/g, "N/A")
              : "N/A",
          instructor: data.profileData.instructor
            ? String(data.profileData.instructor)
            : "Chưa có",
          trainingPoints: data.profileData.trainingPoints
            ? String(data.profileData.trainingPoints)
            : "0 điểm",
          attendancePoints: data.profileData.attendancePoints
            ? String(data.profileData.attendancePoints)
            : "0/0 buổi",
          lastBeltDate:
            data.profileData.lastBeltDate &&
            data.profileData.lastBeltDate !== "NaN"
              ? String(data.profileData.lastBeltDate).replace(/NaN/g, "N/A")
              : "N/A",
          status: data.profileData.status
            ? String(data.profileData.status)
            : "Inactive",
          avatarUrl: data.profileData.avatarUrl || undefined,
        };
        setProfileData(validatedProfile);
      } else {
        setProfileData(null);
      }

      setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
      setBeltHistory(Array.isArray(data.beltHistory) ? data.beltHistory : []);
      setAchievements(
        Array.isArray(data.achievements) ? data.achievements : []
      );
      setAttendanceRecords(
        Array.isArray(data.attendanceRecords) ? data.attendanceRecords : []
      );
      setCertificates(
        Array.isArray(data.certificates) ? data.certificates : []
      );
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      useToast.error("Không thể tải dữ liệu profile");
      // Set default values on error
      setProfileData(null);
      setEnrollments([]);
      setBeltHistory([]);
      setAchievements([]);
      setAttendanceRecords([]);
      setCertificates([]);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    if (loginSuccess) {
      Promise.all([
        fetchProfileData(),
        fetchPaymentMethods(),
        fetchMyPaymentMethods(),
      ]).catch((error) => {
        console.error("Error loading data:", error);
      });
    }
  }, [
    loginSuccess,
    fetchProfileData,
    fetchPaymentMethods,
    fetchMyPaymentMethods,
  ]);

  // Refresh profile data after update
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
    };

    // Listen for profile update events
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [fetchProfileData]);

  // Handle profile update success - defined after fetchProfileData
  const handleProfileUpdateSuccess = useCallback(() => {
    // Refresh profile data after update
    fetchProfileData();
    setSelectedAvatarFile(null);
    setIsUpdateProfileModalOpen(false);
  }, [fetchProfileData]);

  // Memoized computed values
  const hasPaymentMethods = useMemo(
    () => myPaymentMethods.length > 0,
    [myPaymentMethods.length]
  );

  // Get initial avatar
  const getInitialAvatar = useCallback((email: string): string => {
    return email ? email.charAt(0).toUpperCase() : "U";
  }, []);

  // Calculate years of training from created_at
  const calculateYearsTraining = useCallback((createdAt?: string): string => {
    if (!createdAt) return "N/A";
    try {
      const startDate = new Date(createdAt);
      if (isNaN(startDate.getTime())) {
        return "N/A";
      }
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const daysDiff = diffTime / (1000 * 60 * 60 * 24);
      const diffYears = Math.floor(daysDiff / 365);

      if (diffYears > 0) {
        return `${diffYears} năm`;
      } else if (daysDiff >= 30) {
        const months = Math.floor(daysDiff / 30);
        return `${months} tháng`;
      } else {
        return "Dưới 1 tháng";
      }
    } catch (error) {
      return "N/A";
    }
  }, []);

  // Get years training from user created_at
  const yearsTraining = useMemo(() => {
    // Lấy created_at từ user data đã fetch hoặc từ account
    const createdAt = userCreatedAt || (account as any)?.created_at;
    return calculateYearsTraining(createdAt);
  }, [userCreatedAt, account, calculateYearsTraining]);

  // Show loading while component not mounted or account not loaded or profile data loading
  if (!account || !mounted || isLoadingProfile) {
    return <Loading />;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <UpdateProfileModal
        key="update-profile-modal"
        isOpen={isUpdateProfileModalOpen}
        onClose={handleCloseUpdateProfileModal}
        onSuccess={handleProfileUpdateSuccess}
        initialAvatarFile={selectedAvatarFile}
        initialAvatarPreview={avatarPreview}
      />
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

      {/* Mobile Toggle Button - Outside Sidebar */}
      <button
        onClick={toggleMobileMenu}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          background: "#1a1a1a",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          padding: "10px",
          cursor: "pointer",
          zIndex: 1002,
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "none",
        }}
        className="header-toggle-mobile"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "280px",
          height: "100vh",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
          transition: "transform 0.3s ease",
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="profile-sidebar"
      >
        {/* Close Button Inside Sidebar */}
        <button
          onClick={toggleMobileMenu}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            padding: "10px",
            cursor: "pointer",
            zIndex: 1001,
            display: "none",
          }}
          className="header-toggle-close"
        >
          ✕
        </button>

        {/* Profile Image */}
        <div
          style={{
            padding: "40px 20px 20px",
            textAlign: "center",
            borderBottom: "1px solid #333",
          }}
          className="profile-img"
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "48px",
              fontWeight: "bold",
            }}
          >
            {avatarPreview ||
            profileData?.avatarUrl ||
            (account as any)?.avatarUrl ? (
              <img
                src={
                  avatarPreview ||
                  profileData?.avatarUrl ||
                  (account as any)?.avatarUrl ||
                  ""
                }
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className="img-fluid rounded-circle"
              />
            ) : (
              <span>{getInitialAvatar(account?.email || "")}</span>
            )}
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("hero");
            }}
            style={{
              textDecoration: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="logo"
          >
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
                color: "#fff",
              }}
              className="sitename"
            >
              Hồ Sơ Võ Sinh
            </h1>
          </a>
        </div>

        {/* Navigation Menu */}
        <nav
          id="navmenu"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 0",
          }}
          className="navmenu"
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("hero");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "hero" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "hero"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "hero"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "hero" ? "active" : ""}
              >
                Trang Chủ
              </a>
            </li>
            <li>
              <a
                href="#martial-arts"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("martial-arts");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "martial-arts" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "martial-arts"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "martial-arts"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "martial-arts" ? "active" : ""}
              >
                Thông Tin Võ Thuật
              </a>
            </li>
            <li>
              <a
                href="#progress"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("progress");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "progress" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "progress"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "progress"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "progress" ? "active" : ""}
              >
                Tiến Độ & Thành Tích
              </a>
            </li>
            <li>
              <a
                href="#schedule"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("schedule");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "schedule" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "schedule"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "schedule"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "schedule" ? "active" : ""}
              >
                Lịch Học
              </a>
            </li>
            <li>
              <a
                href="#certificates"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("certificates");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "certificates" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "certificates"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "certificates"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "certificates" ? "active" : ""}
              >
                Chứng Chỉ & Huy Chương
              </a>
            </li>
            <li>
              <a
                href="#attendance"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("attendance");
                }}
                style={{
                  display: "block",
                  padding: "12px 20px",
                  color: activeSection === "attendance" ? "#667eea" : "#fff",
                  textDecoration: "none",
                  backgroundColor:
                    activeSection === "attendance"
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                  borderLeft:
                    activeSection === "attendance"
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
                className={activeSection === "attendance" ? "active" : ""}
              >
                Điểm Danh & Hoạt Động
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Main Content */}
      <main
        className="main"
        style={{
          flex: 1,
          marginLeft: "280px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {/* Hero Section */}
        <section
          id="hero"
          style={{
            padding: "60px 0",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "40px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "40px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          cursor: "pointer",
                          transition: "transform 0.3s",
                          backgroundColor: "#6c757d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "64px",
                          fontWeight: "bold",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {avatarPreview ||
                        profileData?.avatarUrl ||
                        (account as any)?.avatarUrl ? (
                          <img
                            src={
                              avatarPreview ||
                              profileData?.avatarUrl ||
                              (account as any)?.avatarUrl ||
                              ""
                            }
                            alt="Ảnh đại diện"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>{getInitialAvatar(account?.email || "")}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarFileChange}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                        style={{
                          padding: "10px 24px",
                          backgroundColor: "#667eea",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Chọn ảnh
                      </button>
                    </div>
                    <p
                      style={{
                        color: "#666",
                        marginTop: "12px",
                        fontSize: "14px",
                      }}
                    >
                      Cập nhật ảnh đại diện
                    </p>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "28px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {profileData?.name || account?.email || "Người dùng"}
                      </h2>
                      <span
                        style={{
                          backgroundColor:
                            profileData?.status === "Active"
                              ? "#28a745"
                              : "#dc3545",
                          color: "#fff",
                          padding: "6px 16px",
                          borderRadius: "50px",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {profileData?.status || "Inactive"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "18px",
                        color: "#666",
                        marginBottom: "24px",
                      }}
                    >
                      Võ Sinh - CLB Võ Thuật
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <strong
                          style={{
                            color: "#666",
                            marginRight: "8px",
                            minWidth: "140px",
                          }}
                        >
                          Username:
                        </strong>
                        <span>
                          {profileData?.username ||
                            account?.email?.split("@")[0] ||
                            "N/A"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <strong
                          style={{
                            color: "#666",
                            marginRight: "8px",
                            minWidth: "140px",
                          }}
                        >
                          Mã hội viên:
                        </strong>
                        <span>
                          {(() => {
                            const maHoiVien = userData?.ma_hoi_vien;
                            if (maHoiVien === null || maHoiVien === undefined) {
                              return "Chưa có mã";
                            }
                            const str = String(maHoiVien).trim();
                            if (str === "" || str === "NaN" || str === "null" || str === "undefined") {
                              return "Chưa có mã";
                            }
                            return str;
                          })()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <strong
                          style={{
                            color: "#666",
                            marginRight: "8px",
                            minWidth: "140px",
                          }}
                        >
                          Cấp đai:
                        </strong>
                        <span
                          style={{
                            backgroundColor:
                              profileData?.beltColor || "#FFD700",
                            color: "#000",
                            padding: "6px 16px",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {profileData?.beltLevel || "Chưa có"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <strong
                          style={{
                            color: "#666",
                            marginRight: "8px",
                            minWidth: "140px",
                          }}
                        >
                          Số năm tập:
                        </strong>
                        <span>{yearsTraining}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <strong
                          style={{
                            color: "#666",
                            marginRight: "8px",
                            minWidth: "140px",
                          }}
                        >
                          Huấn luyện viên:
                        </strong>
                        <span>{profileData?.instructor || "Chưa có"}</span>
                      </div>
                    </div>
                    <hr
                      style={{
                        margin: "24px 0",
                        border: "none",
                        borderTop: "1px solid #e0e0e0",
                      }}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "24px",
                      }}
                    >
                      <div>
                        <h5
                          style={{
                            marginBottom: "16px",
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                        >
                          cập nhật
                        </h5>
                        <div style={{ marginBottom: "16px" }}>
                          <button
                            type="button"
                            onClick={handleOpenUpdateProfile}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "transparent",
                              color: "#667eea",
                              border: "1px solid #667eea",
                              borderRadius: "50px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#667eea";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#667eea";
                            }}
                          >
                            Cập nhật thông tin
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Martial Arts Information Section */}
        <section
          id="martial-arts"
          style={{
            padding: "60px 0",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Thông Tin Võ Thuật
              </h2>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Thông tin về cấp đai và quá trình tập luyện
              </p>
            </div>
            <div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "24px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Thông Tin Võ Thuật
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "24px",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Cấp đai hiện tại:
                    </strong>
                    <div style={{ marginTop: "8px" }}>
                      <span
                        style={{
                          backgroundColor: profileData?.beltColor || "#FFD700",
                          color: "#000",
                          padding: "10px 20px",
                          borderRadius: "4px",
                          fontSize: "16px",
                          fontWeight: "500",
                          display: "inline-block",
                        }}
                      >
                        {profileData?.beltLevel || "Chưa có"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Ngày lên đai gần nhất:
                    </strong>
                    <p style={{ margin: "8px 0 0", color: "#666" }}>
                      {profileData?.lastBeltDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Huấn luyện viên phụ trách:
                    </strong>
                    <p style={{ margin: "8px 0 0", color: "#666" }}>
                      {profileData?.instructor || "Chưa có"}
                    </p>
                  </div>
                  <div>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Số năm tập luyện:
                    </strong>
                    <p style={{ margin: "8px 0 0", color: "#666" }}>
                      {yearsTraining}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress & Achievements Section */}
        <section
          id="progress"
          style={{
            padding: "60px 0",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Tiến Độ & Thành Tích
              </h2>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Điểm luyện tập, lịch sử thi lên đai và giải đấu
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Điểm Luyện Tập
                </h3>
                <p style={{ marginBottom: "0", color: "#666" }}>
                  <strong>Điểm danh tháng này:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    {profileData?.attendancePoints || "0/0 buổi"}
                  </span>
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Lịch Sử Thi Lên Đai
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {beltHistory.length > 0 ? (
                    beltHistory.map((history, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom:
                            index < beltHistory.length - 1 ? "12px" : "0",
                          paddingBottom:
                            index < beltHistory.length - 1 ? "12px" : "0",
                          borderBottom:
                            index < beltHistory.length - 1
                              ? "1px solid #e0e0e0"
                              : "none",
                        }}
                      >
                        <strong style={{ color: "#333" }}>
                          {history.date}
                        </strong>{" "}
                        - Đạt đai{" "}
                        <span
                          style={{
                            backgroundColor: history.beltColor || "#FFD700",
                            color: "#000",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            marginLeft: "8px",
                          }}
                        >
                          {history.belt}
                        </span>{" "}
                        - Kết quả: {history.result}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "#666" }}>
                      Chưa có lịch sử thi lên đai
                    </li>
                  )}
                </ul>
              </div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Giải Đấu & Thành Tích
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {achievements.length > 0 ? (
                    achievements.map((achievement, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom:
                            index < achievements.length - 1 ? "12px" : "0",
                          paddingBottom:
                            index < achievements.length - 1 ? "12px" : "0",
                          borderBottom:
                            index < achievements.length - 1
                              ? "1px solid #e0e0e0"
                              : "none",
                        }}
                      >
                        <strong style={{ color: "#333" }}>
                          {achievement.title}
                        </strong>{" "}
                        - {achievement.competition}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "#666" }}>Chưa có thành tích</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Class Schedule Section */}
        <section
          id="schedule"
          style={{
            padding: "60px 0",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Lịch Học / Lớp Đang Tham Gia
              </h2>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Thông tin về lớp học và thời khóa biểu
              </p>
            </div>
            <div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "24px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Lớp Đang Tham Gia
                </h3>
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.id} style={{ marginBottom: "24px" }}>
                      <h4
                        style={{
                          marginBottom: "12px",
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {enrollment.course?.title || "Lớp học"}
                      </h4>
                      <p style={{ marginBottom: "8px", color: "#666" }}>
                        <strong style={{ color: "#333" }}>Mô tả:</strong>{" "}
                        {enrollment.course?.description || "N/A"}
                      </p>
                      <p style={{ marginBottom: "8px", color: "#666" }}>
                        <strong style={{ color: "#333" }}>Cấp độ:</strong>{" "}
                        {enrollment.course?.level || "N/A"}
                      </p>
                      <p style={{ marginBottom: "8px", color: "#666" }}>
                        <strong style={{ color: "#333" }}>Ngày đăng ký:</strong>{" "}
                        {enrollment.enrollment_date
                          ? formatDate(enrollment.enrollment_date)
                          : "N/A"}
                      </p>
                      <p style={{ marginBottom: "0", color: "#666" }}>
                        <strong style={{ color: "#333" }}>Trạng thái:</strong>{" "}
                        <span
                          style={{
                            backgroundColor:
                              enrollment.status === "approved"
                                ? "#28a745"
                                : enrollment.status === "pending"
                                  ? "#ffc107"
                                  : "#dc3545",
                            color: "#fff",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            marginLeft: "8px",
                          }}
                        >
                          {enrollment.status === "approved"
                            ? "Đã duyệt"
                            : enrollment.status === "pending"
                              ? "Đang chờ"
                              : "Từ chối"}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>Chưa có lớp học nào</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Certificates Section */}
        <section
          id="certificates"
          style={{
            padding: "60px 0",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Chứng Chỉ - Huy Chương - Giấy Khen
              </h2>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Danh sách chứng chỉ, huy chương và giấy khen đã đạt được
              </p>
            </div>
            {certificates.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {certificates.map((cert, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      padding: "24px",
                    }}
                  >
                    <h4
                      style={{
                        marginBottom: "12px",
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {cert.title}
                    </h4>
                    <p style={{ marginBottom: "16px", color: "#666" }}>
                      Số seri: {cert.serial}
                    </p>
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        backgroundColor: "#e9ecef",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        overflow: "hidden",
                      }}
                    >
                      {cert.image ? (
                        <img
                          src={cert.image}
                          alt={cert.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>[Hình ảnh {cert.title}]</span>
                      )}
                    </div>
                    {cert.hasPdf && (
                      <button
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        {cert.title.includes("Chứng Chỉ")
                          ? "Xem PDF"
                          : "Tải PDF"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ textAlign: "center", color: "#666", padding: "40px" }}
              >
                Chưa có chứng chỉ, huy chương hoặc giấy khen
              </div>
            )}
          </div>
        </section>

        {/* Attendance & Activities Section */}
        <section
          id="attendance"
          style={{
            padding: "60px 0",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Điểm Danh & Hoạt Động
              </h2>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Thống kê điểm danh và hoạt động tập luyện
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / -1",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Thống Kê Tháng Này
                </h3>
                <p style={{ marginBottom: "16px", color: "#666" }}>
                  <strong style={{ color: "#333" }}>
                    Số buổi đã tham gia:
                  </strong>{" "}
                  <span style={{ color: "#333" }}>
                    {profileData?.attendancePoints || "0/0 buổi"}
                  </span>
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "24px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {(() => {
                    const attendanceMatch =
                      profileData?.attendancePoints?.match(/(\d+)\/(\d+)/);
                    let percentage = 0;
                    if (
                      attendanceMatch &&
                      attendanceMatch[1] &&
                      attendanceMatch[2]
                    ) {
                      const present = parseInt(attendanceMatch[1], 10);
                      const total = parseInt(attendanceMatch[2], 10);
                      if (!isNaN(present) && !isNaN(total) && total > 0) {
                        percentage = Math.round((present / total) * 100);
                        percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
                      }
                    }
                    return (
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor: "#007bff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {percentage}%
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h4
                  style={{
                    marginBottom: "16px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Lịch Sử Điểm Danh Chi Tiết
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          Ngày
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          Giờ
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom:
                                index < attendanceRecords.length - 1
                                  ? "1px solid #e0e0e0"
                                  : "none",
                            }}
                          >
                            <td style={{ padding: "12px", color: "#666" }}>
                              {formatDate(record.date)}
                            </td>
                            <td style={{ padding: "12px", color: "#666" }}>
                              {record.time}
                            </td>
                            <td style={{ padding: "12px" }}>
                              <span
                                style={{
                                  backgroundColor:
                                    record.status === "present"
                                      ? "#28a745"
                                      : "#dc3545",
                                  color: "#fff",
                                  padding: "4px 12px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                {record.status === "present"
                                  ? "Có mặt"
                                  : "Vắng"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            Chưa có lịch sử điểm danh
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "32px",
                }}
              >
                <h4
                  style={{
                    marginBottom: "16px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Thống Kê Dạng Biểu Đồ
                </h4>
                <div
                  style={{
                    width: "100%",
                    height: "300px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  [Biểu đồ điểm danh 6 tháng gần nhất]
                </div>
                <p
                  style={{
                    color: "#666",
                    marginTop: "12px",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  Biểu đồ điểm danh 6 tháng gần nhất
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods Section - Giữ nguyên chức năng */}
        <section
          style={{
            padding: "60px 0",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    margin: 0,
                    color: "#333",
                  }}
                >
                  Phương thức thanh toán
                </h2>
                <button
                  onClick={handleAddNewPayment}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>+</span>
                  <span>Thêm</span>
                </button>
              </div>

              <div>
                {hasPaymentMethods ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {myPaymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "16px",
                            backgroundColor: "#f9f9f9",
                            borderBottom: "1px solid #e0e0e0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span style={{ fontSize: "20px" }}>💳</span>
                            <div>
                              <div
                                style={{
                                  fontWeight: "600",
                                  textTransform: "capitalize",
                                  marginBottom: "4px",
                                }}
                              >
                                {pm.method}
                              </div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {pm.isActive ? (
                                  <span style={{ color: "#28a745" }}>
                                    ✓ Active
                                  </span>
                                ) : (
                                  <span style={{ color: "#999" }}>
                                    ✗ Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditPayment(pm)}
                              title="Edit payment method"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "transparent",
                                border: "1px solid #007bff",
                                color: "#007bff",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => confirmDeletePayment(pm)}
                              title="Delete payment method"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "transparent",
                                border: "1px solid #dc3545",
                                color: "#dc3545",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(150px, 1fr))",
                              gap: "16px",
                              marginBottom: "16px",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Account Name
                              </div>
                              <div style={{ fontWeight: "600" }}>
                                {pm.accountName}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Account Number
                              </div>
                              <div
                                style={{
                                  fontWeight: "600",
                                  fontFamily: "monospace",
                                }}
                              >
                                {pm.accountNumber}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Provider
                              </div>
                              <div style={{ fontWeight: "600" }}>
                                {pm.providerName}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "4px",
                                }}
                              >
                                Created
                              </div>
                              <div style={{ fontWeight: "600" }}>
                                {formatDate(pm.createdAt)}
                              </div>
                            </div>
                          </div>
                          {pm.instructions && (
                            <div style={{ marginTop: "16px" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "8px",
                                }}
                              >
                                Instructions
                              </div>
                              <div
                                style={{
                                  backgroundColor: "#f9f9f9",
                                  padding: "12px",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                }}
                              >
                                {pm.instructions}
                              </div>
                            </div>
                          )}
                          {pm.qrCodeUrl && (
                            <div style={{ marginTop: "16px" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "8px",
                                }}
                              >
                                QR Code
                              </div>
                              <img
                                src={pm.qrCodeUrl}
                                alt="QR Code"
                                style={{
                                  maxWidth: "150px",
                                  maxHeight: "150px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      💳
                    </div>
                    <h3
                      style={{
                        fontSize: "18px",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Chưa có phương thức thanh toán
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#999",
                        marginBottom: "20px",
                      }}
                    >
                      Bạn chưa thêm phương thức thanh toán nào.
                    </p>
                    <button
                      onClick={handleAddNewPayment}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      + Thêm phương thức thanh toán đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (min-width: 1200px) {
          .profile-sidebar {
            transform: translateX(0) !important;
          }
          .header-toggle-mobile {
            display: none !important;
          }
          .header-toggle-close {
            display: none !important;
          }
          .main {
            margin-left: 280px !important;
          }
        }
        @media (max-width: 1199px) {
          .profile-sidebar {
            transform: translateX(-100%);
          }
          .header-toggle-mobile {
            display: block !important;
          }
          .header-toggle-close {
            display: block !important;
          }
          .main {
            margin-left: 0 !important;
          }
        }
        .navmenu a:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
        }
        .navmenu a.active {
          background-color: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
          border-left: 3px solid #667eea !important;
        }
      `}</style>
    </div>
  );
}
