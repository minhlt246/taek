"use client";

import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";

export default function AdminDashboard() {
  const { account } = useAccountStore();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Load additional scripts for dashboard after DOM is ready
    // jQuery must be loaded first (loaded in layout)
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout loading script: ${src}`));
        }, 5000);

        script.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        script.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load script: ${src}`));
        };

        document.body.appendChild(script);
      });
    };

    // Wait for jQuery to be available, then load dashboard scripts
    const loadDashboardScripts = async () => {
      // Wait for jQuery to be ready with timeout
      const waitForJQuery = () => {
        return new Promise<void>((resolve, reject) => {
          if (typeof window !== "undefined" && (window as any).jQuery) {
            resolve();
            return;
          }

          let attempts = 0;
          const maxAttempts = 20; // Max 1 second (20 * 50ms)
          const checkInterval = setInterval(() => {
            attempts++;
            if ((window as any).jQuery) {
              clearInterval(checkInterval);
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              reject(new Error("jQuery timeout"));
            }
          }, 50);
        });
      };

      try {
        // Wait for jQuery to be ready (with timeout)
        await waitForJQuery();

        // Load scripts in parallel for faster loading
        await Promise.allSettled([
          loadScript(
            "/styles/assets/plugins/datatables/js/jquery.dataTables.min.js"
          ),
          loadScript(
            "/styles/assets/plugins/datatables/js/dataTables.bootstrap5.min.js"
          ),
          loadScript("/styles/assets/js/moment.min.js"),
          loadScript(
            "/styles/assets/plugins/daterangepicker/daterangepicker.js"
          ),
          loadScript("/styles/assets/plugins/apexchart/apexcharts.min.js"),
        ]);

        console.log("Dashboard scripts loaded successfully");
        setScriptsLoaded(true);
      } catch (error) {
        console.error("Error loading dashboard scripts:", error);
        // Still set to loaded to show content even if scripts fail
        setScriptsLoaded(true);
      }
    };

    // Start loading after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadDashboardScripts();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Scripts are loaded via useEffect above */}

      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
        <div>
          <h4 className="mb-0">Tổng Quan Hệ Thống</h4>
          <p className="text-muted mb-0">
            Bảng điều khiển quản lý câu lạc bộ Taekwondo
          </p>
        </div>
        <div className="gap-2 d-flex align-items-center flex-wrap">
          <div className="daterangepick form-control w-auto d-flex align-items-center">
            <i className="ti ti-calendar text-dark me-2"></i>
            <span className="reportrange-picker-field text-dark">
              Tuần trước
            </span>
          </div>
          <a
            href="javascript:void(0);"
            className="btn btn-icon btn-outline-light shadow"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            aria-label="Làm mới"
            data-bs-original-title="Làm mới"
          >
            <i className="ti ti-refresh"></i>
          </a>
          <a
            href="javascript:void(0);"
            className="btn btn-icon btn-outline-light shadow"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            aria-label="Thu gọn"
            data-bs-original-title="Thu gọn"
            id="collapse-header"
          >
            <i className="ti ti-transition-top"></i>
          </a>
        </div>
      </div>

      {/* Dashboard Content from HTML */}
      <div className="row">
        <div className="col-md-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h6 className="mb-0">Võ Sinh Mới Đăng Ký</h6>
              <div className="dropdown">
                <a
                  className="dropdown-toggle btn btn-outline-light shadow"
                  data-bs-toggle="dropdown"
                  href="javascript:void(0);"
                >
                  30 ngày qua
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a href="javascript:void(0);" className="dropdown-item">
                    15 ngày qua
                  </a>
                  <a href="javascript:void(0);" className="dropdown-item">
                    30 ngày qua
                  </a>
                  <a href="javascript:void(0);" className="dropdown-item">
                    3 tháng qua
                  </a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive custom-table">
                <table
                  className="table dataTable table-nowrap"
                  id="deals-project"
                >
                  <thead className="table-light">
                    <tr>
                      <th>Họ Tên</th>
                      <th>Cấp Đai</th>
                      <th>Ngày Đăng Ký</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nguyễn Văn A</td>
                      <td>
                        <span className="badge bg-warning">Trắng</span>
                      </td>
                      <td>20/11/2024</td>
                      <td>
                        <span className="badge bg-success">Hoạt Động</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Trần Thị B</td>
                      <td>
                        <span className="badge bg-info">Vàng</span>
                      </td>
                      <td>18/11/2024</td>
                      <td>
                        <span className="badge bg-success">Hoạt Động</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Lê Văn C</td>
                      <td>
                        <span className="badge bg-secondary">Đen</span>
                      </td>
                      <td>15/11/2024</td>
                      <td>
                        <span className="badge bg-warning">Tạm Nghỉ</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h6 className="mb-0">Thống Kê Võ Sinh Theo Cấp Đai</h6>
                <div className="d-flex align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      Tất Cả
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        Trắng - Vàng
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Xanh - Đỏ
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Đen
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Tất Cả
                      </a>
                    </div>
                  </div>
                  <div className="dropdown">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      30 Ngày
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        7 Ngày
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        30 Ngày
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        90 Ngày
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              <div id="deals-chart"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h6 className="mb-0">Võ Sinh Đã Nghỉ Học</h6>
                <div className="d-flex align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      Lý Do
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        Tự Động Nghỉ
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Chuyển Lớp
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Tất Cả
                      </a>
                    </div>
                  </div>
                  <div className="dropdown">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      30 Ngày
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        30 Ngày
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        6 Tháng
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        12 Tháng
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              <div id="last-chart"></div>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h6 className="mb-0">Võ Sinh Thăng Đai Thành Công</h6>
                <div className="d-flex align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      Cấp Đai
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        Trắng - Vàng
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Xanh - Đỏ
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Đen
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        Tất Cả
                      </a>
                    </div>
                  </div>
                  <div className="dropdown">
                    <a
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      href="javascript:void(0);"
                    >
                      30 Ngày
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="javascript:void(0);" className="dropdown-item">
                        30 Ngày
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        6 Tháng
                      </a>
                      <a href="javascript:void(0);" className="dropdown-item">
                        12 Tháng
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              <div id="won-chart"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 d-flex">
          <div className="card w-100">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h6 className="mb-0">Thống Kê Theo Năm</h6>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <a
                    className="dropdown-toggle btn btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    href="javascript:void(0);"
                  >
                    Loại Thống Kê
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="javascript:void(0);" className="dropdown-item">
                      Đăng Ký Mới
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      Thăng Đai
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      Doanh Thu
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      Tất Cả
                    </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a
                    className="dropdown-toggle btn btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    href="javascript:void(0);"
                  >
                    Khoảng Thời Gian
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="javascript:void(0);" className="dropdown-item">
                      3 Tháng
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      6 Tháng
                    </a>
                    <a href="javascript:void(0);" className="dropdown-item">
                      12 Tháng
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              <div id="deals-year"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
