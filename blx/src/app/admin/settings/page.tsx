"use client";

import { useState, useEffect } from "react";
import { settingsApi } from "@/services/adminApi";

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
      siteName: "Taekwondo Club Management",
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
      logoUrl: "/images/logo.png",
      faviconUrl: "/images/favicon.ico",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    // Simulate API call to fetch settings
    const fetchSettings = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      try {
        await settingsApi.reset();
        // Reload settings from API
        const defaultSettings = await settingsApi.getAll();
        setSettings(defaultSettings);
        alert("Settings reset to default values!");
      } catch (error) {
        console.error("Failed to reset settings:", error);
        alert("Failed to reset settings. Please try again.");
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
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>System Settings</h2>
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
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Settings
              </>
            )}
          </button>
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            <i className="fas fa-undo mr-2"></i>
            Reset to Default
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
                  General
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "notifications" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <i className="fas fa-bell mr-2"></i>
                  Notifications
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "security" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Security
                </button>
                <button
                  className={`list-group-item list-group-item-action ${
                    activeTab === "appearance" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("appearance")}
                >
                  <i className="fas fa-palette mr-2"></i>
                  Appearance
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow">
            <div className="card-body">
              {/* General Settings */}
              {activeTab === "general" && (
                <div>
                  <h5 className="mb-4">General Settings</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Site Name</label>
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
                        <label className="form-label">Admin Email</label>
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
                    <label className="form-label">Site Description</label>
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
                        <label className="form-label">Timezone</label>
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
                        <label className="form-label">Language</label>
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
                        <label className="form-label">Currency</label>
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
                          Email Notifications
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
                          SMS Notifications
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
                          Push Notifications
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
                          Event Reminders
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
                          Payment Reminders
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
                          System Alerts
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div>
                  <h5 className="mb-4">Security Settings</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Session Timeout (minutes)
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
                        <label className="form-label">Max Login Attempts</label>
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
                          Allow Password Reset
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <div>
                  <h5 className="mb-4">Appearance Settings</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Theme</label>
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
                        <label className="form-label">Primary Color</label>
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
                        <label className="form-label">Logo URL</label>
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
                        <label className="form-label">Favicon URL</label>
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
