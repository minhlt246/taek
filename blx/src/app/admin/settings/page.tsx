"use client";

import { useState, useEffect } from "react";
import { settingsApi } from "@/services/api/settings";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    eventReminders: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowPasswordReset: boolean;
    maxLoginAttempts: number;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "Taekwondo Đồng Phú Management",
      siteDescription: "Professional Taekwondo club management system",
      adminEmail: "admin@taekwondo.com",
      timezone: "Asia/Ho_Chi_Minh",
      language: "vi",
      currency: "VND",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      eventReminders: true,
      paymentReminders: true,
      systemAlerts: true,
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowPasswordReset: true,
      maxLoginAttempts: 5,
    },
    appearance: {
      theme: "light",
      primaryColor: "#007bff",
      logoUrl: "/client/images/logo.png",
      faviconUrl: "/images/favicon.ico",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    // Lấy cài đặt hệ thống từ API
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/settings');
        // setSettings(response.data);
      } catch (error) {
        console.error("Lỗi khi tải cài đặt hệ thống:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      alert("Lưu cài đặt thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      alert("Lỗi khi lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Bạn có chắc chắn muốn reset tất cả cài đặt về mặc định?")) {
      try {
        await settingsApi.reset();
        // Reload settings from API
        const defaultSettings = await settingsApi.getAll();
        setSettings(defaultSettings);
        alert("Reset cài đặt về giá trị mặc định thành công!");
      } catch (error) {
        console.error("Lỗi khi reset cài đặt:", error);
        alert("Lỗi khi reset cài đặt. Vui lòng thử lại.");
      }
    }
  };

  const updateGeneralSettings = (field: string, value: string) => {
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [field]: value,
      },
    });
  };

  const updateNotificationSettings = (field: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: value,
      },
    });
  };

  const updateSecuritySettings = (field: string, value: number | boolean) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [field]: value,
      },
    });
  };

  const updateAppearanceSettings = (field: string, value: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [field]: value,
      },
    });
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
    <div className="settings-page">
      <div>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Lưu cài đặt
              </>
            )}
          </button>
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            <i className="fas fa-undo mr-2"></i>
            Reset về mặc định
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3">
          <div className="card shadow">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "general" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  <i className="fas fa-cog mr-2"></i>
                  Chung
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "notifications" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <i className="fas fa-bell mr-2"></i>
                  Thông báo
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "security" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Bảo mật
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "appearance" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("appearance")}
                >
                  <i className="fas fa-palette mr-2"></i>
                  Giao diện
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow">
            <div className="card-body">
              {/* Cài đặt chung */}
              {activeTab === "general" && (
                <div>
                  <h5 className="mb-4">Cài đặt chung</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tên trang web</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settings.general.siteName}
                          onChange={(e) =>
                            updateGeneralSettings("siteName", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email quản trị</label>
                        <input
                          type="email"
                          className="form-control"
                          value={settings.general.adminEmail}
                          onChange={(e) =>
                            updateGeneralSettings("adminEmail", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả trang web</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={settings.general.siteDescription}
                      onChange={(e) =>
                        updateGeneralSettings("siteDescription", e.target.value)
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Múi giờ</label>
                        <select
                          className="form-select"
                          value={settings.general.timezone}
                          onChange={(e) =>
                            updateGeneralSettings("timezone", e.target.value)
                          }
                        >
                          <option value="Asia/Ho_Chi_Minh">
                            Asia/Ho_Chi_Minh
                          </option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">
                            America/New_York
                          </option>
                          <option value="Europe/London">Europe/London</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Ngôn ngữ</label>
                        <select
                          className="form-select"
                          value={settings.general.language}
                          onChange={(e) =>
                            updateGeneralSettings("language", e.target.value)
                          }
                        >
                          <option value="vi">Vietnamese</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Tiền tệ</label>
                        <select
                          className="form-select"
                          value={settings.general.currency}
                          onChange={(e) =>
                            updateGeneralSettings("currency", e.target.value)
                          }
                        >
                          <option value="VND">VND (Vietnamese Dong)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div>
                  <h5 className="mb-4">Notification Settings</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "emailNotifications",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="emailNotifications"
                        >
                          Thông báo Email
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="smsNotifications"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "smsNotifications",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="smsNotifications"
                        >
                          Thông báo SMS
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "pushNotifications",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="pushNotifications"
                        >
                          Thông báo Push
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="eventReminders"
                          checked={settings.notifications.eventReminders}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "eventReminders",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="eventReminders"
                        >
                          Nhắc nhở sự kiện
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="paymentReminders"
                          checked={settings.notifications.paymentReminders}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "paymentReminders",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="paymentReminders"
                        >
                          Nhắc nhở thanh toán
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="systemAlerts"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) =>
                            updateNotificationSettings(
                              "systemAlerts",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="systemAlerts"
                        >
                          Cảnh báo hệ thống
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cài đặt bảo mật */}
              {activeTab === "security" && (
                <div>
                  <h5 className="mb-4">Cài đặt bảo mật</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Thời gian hết hạn phiên (phút)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.security.sessionTimeout}
                          onChange={(e) =>
                            updateSecuritySettings(
                              "sessionTimeout",
                              parseInt(e.target.value)
                            )
                          }
                          min="5"
                          max="480"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Password Minimum Length
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.security.passwordMinLength}
                          onChange={(e) =>
                            updateSecuritySettings(
                              "passwordMinLength",
                              parseInt(e.target.value)
                            )
                          }
                          min="6"
                          max="20"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Số lần đăng nhập tối đa
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) =>
                            updateSecuritySettings(
                              "maxLoginAttempts",
                              parseInt(e.target.value)
                            )
                          }
                          min="3"
                          max="10"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="requireTwoFactor"
                          checked={settings.security.requireTwoFactor}
                          onChange={(e) =>
                            updateSecuritySettings(
                              "requireTwoFactor",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="requireTwoFactor"
                        >
                          Require Two-Factor Authentication
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="allowPasswordReset"
                          checked={settings.security.allowPasswordReset}
                          onChange={(e) =>
                            updateSecuritySettings(
                              "allowPasswordReset",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="allowPasswordReset"
                        >
                          Cho phép đặt lại mật khẩu
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cài đặt giao diện */}
              {activeTab === "appearance" && (
                <div>
                  <h5 className="mb-4">Cài đặt giao diện</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Chủ đề</label>
                        <select
                          className="form-select"
                          value={settings.appearance.theme}
                          onChange={(e) =>
                            updateAppearanceSettings("theme", e.target.value)
                          }
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Màu chính</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) =>
                            updateAppearanceSettings(
                              "primaryColor",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">URL Logo</label>
                        <input
                          type="url"
                          className="form-control"
                          value={settings.appearance.logoUrl}
                          onChange={(e) =>
                            updateAppearanceSettings("logoUrl", e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">URL Favicon</label>
                        <input
                          type="url"
                          className="form-control"
                          value={settings.appearance.faviconUrl}
                          onChange={(e) =>
                            updateAppearanceSettings(
                              "faviconUrl",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
