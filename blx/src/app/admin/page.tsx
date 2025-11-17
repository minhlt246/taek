"use client";

import React, { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import {
  dashboardApi,
  NewStudent,
  StudentByBeltLevel,
  InactiveStudent,
  BeltPromotion,
} from "@/services/api/dashboard";
import { BeltLevel } from "@/services/api/belt-levels";
import { testRegistrationsApi } from "@/services/api/test-registrations";
import { useToast } from "@/utils/toast";

export default function AdminDashboard() {
  const { account } = useAccountStore();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // State cho dữ liệu dashboard
  const [newStudents, setNewStudents] = useState<NewStudent[]>([]);
  const [studentsByBeltLevel, setStudentsByBeltLevel] = useState<
    StudentByBeltLevel[]
  >([]);
  const [inactiveStudents, setInactiveStudents] = useState<InactiveStudent[]>(
    []
  );
  const [beltPromotions, setBeltPromotions] = useState<BeltPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho filters
  const [newStudentsDays, setNewStudentsDays] = useState(30);
  const [beltLevelStatsDays, setBeltLevelStatsDays] = useState(30);
  const [inactiveStudentsDays, setInactiveStudentsDays] = useState(30);
  const [promotionsDays, setPromotionsDays] = useState(30);
  const [yearlyStatsType, setYearlyStatsType] = useState<string>("all"); // "all" | "registrations" | "promotions" | "revenue"
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Năm được chọn
  const [yearlyStats, setYearlyStats] = useState<any>(null);

  // State cho import Excel
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Fetch dữ liệu từ API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        newStudentsData,
        beltLevelStatsData,
        inactiveStudentsData,
        promotionsData,
        yearlyStatsData,
      ] = await Promise.all([
        dashboardApi.getNewStudents(newStudentsDays),
        dashboardApi.getStudentsByBeltLevel(beltLevelStatsDays),
        dashboardApi.getInactiveStudents(inactiveStudentsDays),
        dashboardApi.getBeltPromotions(promotionsDays),
        dashboardApi.getYearlyStudentStats(selectedYear),
      ]);

      setNewStudents(newStudentsData);
      setStudentsByBeltLevel(beltLevelStatsData);
      setInactiveStudents(inactiveStudentsData);
      setBeltPromotions(promotionsData);
      setYearlyStats(yearlyStatsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [
    newStudentsDays,
    beltLevelStatsDays,
    inactiveStudentsDays,
    promotionsDays,
    selectedYear,
  ]);

  // Handler for Excel import
  const handleImportExcel = async () => {
    if (!importFile) {
      useToast.error("Vui lòng chọn file Excel");
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const result = await testRegistrationsApi.importExcel(importFile);

      if (result.success) {
        setImportResult(result.data);
        useToast.success(`Import thành công ${result.data.imported} bản ghi`);

        // Reset file input
        const fileInput = document.getElementById(
          "excelFile"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setImportFile(null);
      } else {
        useToast.error(result.message || "Import thất bại");
      }
    } catch (error: any) {
      console.error("Error importing Excel:", error);
      useToast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi import file"
      );
    } finally {
      setImporting(false);
    }
  };

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

  // Helper function để format ngày
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function để lấy text color style từ màu API (không có background)
  const getBeltTextStyle = (color?: string): React.CSSProperties => {
    if (!color) return {};
    // Chỉ dùng màu text, không có background
    if (color.startsWith("#") || color.startsWith("rgb")) {
      return { color: color };
    }
    // Nếu là tên màu Bootstrap, map sang text color
    const colorMap: Record<string, string> = {
      primary: "#0d6efd",
      secondary: "#6c757d",
      success: "#198754",
      danger: "#dc3545",
      warning: "#ffc107",
      info: "#0dcaf0",
      light: "#f8f9fa",
      dark: "#212529",
    };
    return { color: colorMap[color.toLowerCase()] || color };
  };

  // Vẽ biểu đồ thống kê theo năm
  useEffect(() => {
    if (!scriptsLoaded || loading || !yearlyStats) {
      return;
    }

    // Kiểm tra xem có dữ liệu không (tổng số võ sinh > 0)
    const totalActive = yearlyStats.active.reduce(
      (sum: number, val: number) => sum + val,
      0
    );
    const totalInactive = yearlyStats.inactive.reduce(
      (sum: number, val: number) => sum + val,
      0
    );
    if (totalActive === 0 && totalInactive === 0) {
      return;
    }

    const renderChart = () => {
      if (typeof window === "undefined" || !(window as any).ApexCharts) {
        setTimeout(renderChart, 100);
        return;
      }

      const chartElement = document.getElementById("deals-year");
      if (!chartElement) {
        return;
      }

      // Xóa chart cũ nếu có
      const existingChart = (chartElement as any).chartInstance;
      if (existingChart) {
        existingChart.destroy();
      }

      const { active, inactive, months } = yearlyStats;

      // Tính tổng và tỉ lệ phần trăm
      const totalByMonth = months.map(
        (_: string, idx: number) => active[idx] + inactive[idx]
      );
      const activePercentages = totalByMonth.map((total: number, idx: number) =>
        total > 0 ? ((active[idx] / total) * 100).toFixed(1) : 0
      );
      const inactivePercentages = totalByMonth.map(
        (total: number, idx: number) =>
          total > 0 ? ((inactive[idx] / total) * 100).toFixed(1) : 0
      );

      const options = {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: false,
          },
          fontFamily: "Poppins, sans-serif",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "60%",
            endingShape: "rounded",
            borderRadius: 5,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number, opts: any) {
            const seriesIndex = opts.seriesIndex;
            const dataPointIndex = opts.dataPointIndex;
            const total = totalByMonth[dataPointIndex];
            const percentage =
              seriesIndex === 0
                ? activePercentages[dataPointIndex]
                : inactivePercentages[dataPointIndex];
            return `${val} (${percentage}%)`;
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        series: [
          {
            name: "Võ Sinh Còn Học",
            data: active,
            color: "#0d6efd", // Xanh dương
          },
          {
            name: "Võ Sinh Đã Nghỉ",
            data: inactive,
            color: "#dc3545", // Đỏ
          },
        ],
        xaxis: {
          categories: months,
          labels: {
            style: {
              colors: "#0C1C29",
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          title: {
            text: "Số lượng võ sinh",
          },
          labels: {
            style: {
              colors: "#6D777F",
              fontSize: "14px",
            },
          },
        },
        fill: {
          opacity: 1,
        },
        colors: ["#0d6efd", "#dc3545"],
        tooltip: {
          y: {
            formatter: function (val: number, opts: any) {
              const seriesIndex = opts.seriesIndex;
              const dataPointIndex = opts.dataPointIndex;
              const total = totalByMonth[dataPointIndex];
              const percentage =
                seriesIndex === 0
                  ? activePercentages[dataPointIndex]
                  : inactivePercentages[dataPointIndex];
              const label =
                seriesIndex === 0 ? "Võ Sinh Còn Học" : "Võ Sinh Đã Nghỉ";
              return `${label}: ${val} (${percentage}%)`;
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "right",
        },
        grid: {
          borderColor: "#CED2D4",
          strokeDashArray: 5,
        },
      };

      const chart = new (window as any).ApexCharts(chartElement, options);
      (chartElement as any).chartInstance = chart;
      chart.render();
    };

    renderChart();
  }, [scriptsLoaded, loading, yearlyStats]);

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
      <div className="row">
        <div className="col-md-12">
          <div className="card flex-fill">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h6 className="mb-0">Võ Sinh Mới Đăng Ký</h6>
              <div className="dropdown">
                <a
                  className="dropdown-toggle btn btn-outline-light shadow"
                  data-bs-toggle="dropdown"
                  href="javascript:void(0);"
                >
                  {newStudentsDays === 15
                    ? "15 ngày qua"
                    : newStudentsDays === 30
                    ? "30 ngày qua"
                    : "3 tháng qua"}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(15);
                    }}
                  >
                    15 ngày qua
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(30);
                    }}
                  >
                    30 ngày qua
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(90);
                    }}
                  >
                    3 tháng qua
                  </a>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : (
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
                      {newStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-muted py-4"
                          >
                            Không có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        newStudents.map((student) => {
                          // Belt level luôn có giá trị (đã được xử lý trong service)
                          const beltLevel = student.belt_level;
                          if (!beltLevel) {
                            console.warn(
                              `Student ${student.id} missing belt level`
                            );
                            return null;
                          }
                          const beltName = beltLevel.name || "Chưa xác định";
                          const beltColor = beltLevel.color || "";

                          return (
                            <tr key={student.id}>
                              <td>{student.name || "N/A"}</td>
                              <td>
                                {beltLevel.id > 0 ? (
                                  <span style={getBeltTextStyle(beltColor)}>
                                    {beltName}
                                  </span>
                                ) : (
                                  <span className="text-muted">{beltName}</span>
                                )}
                              </td>
                              <td>{formatDate(student.created_at)}</td>
                              <td>
                                <span
                                  style={{
                                    color: student.is_active
                                      ? "#198754" // success green
                                      : "#ffc107", // warning yellow
                                  }}
                                >
                                  {student.is_active ? "Hoạt Động" : "Tạm Nghỉ"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 d-flex">
          <div className="card flex-fill">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h6 className="mb-0">Võ Sinh</h6>
              <div className="dropdown">
                <a
                  className="dropdown-toggle btn btn-outline-light shadow"
                  data-bs-toggle="dropdown"
                  href="javascript:void(0);"
                >
                  {newStudentsDays === 15
                    ? "15 ngày qua"
                    : newStudentsDays === 30
                    ? "30 ngày qua"
                    : "3 tháng qua"}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(15);
                    }}
                  >
                    15 ngày qua
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(30);
                    }}
                  >
                    30 ngày qua
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewStudentsDays(90);
                    }}
                  >
                    3 tháng qua
                  </a>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : (
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
                      {newStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-muted py-4"
                          >
                            Không có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        newStudents.map((student) => {
                          // Belt level luôn có giá trị (đã được xử lý trong service)
                          const beltLevel = student.belt_level;
                          if (!beltLevel) {
                            console.warn(
                              `Student ${student.id} missing belt level`
                            );
                            return null;
                          }
                          const beltName = beltLevel.name || "Chưa xác định";
                          const beltColor = beltLevel.color || "";

                          return (
                            <tr key={student.id}>
                              <td>{student.name || "N/A"}</td>
                              <td>
                                {beltLevel.id > 0 ? (
                                  <span style={getBeltTextStyle(beltColor)}>
                                    {beltName}
                                  </span>
                                ) : (
                                  <span className="text-muted">{beltName}</span>
                                )}
                              </td>
                              <td>{formatDate(student.created_at)}</td>
                              <td>
                                <span
                                  style={{
                                    color: student.is_active
                                      ? "#198754" // success green
                                      : "#ffc107", // warning yellow
                                  }}
                                >
                                  {student.is_active ? "Hoạt Động" : "Tạm Nghỉ"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
                      {beltLevelStatsDays === 7
                        ? "7 Ngày"
                        : beltLevelStatsDays === 30
                        ? "30 Ngày"
                        : "90 Ngày"}
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setBeltLevelStatsDays(7);
                        }}
                      >
                        7 Ngày
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setBeltLevelStatsDays(30);
                        }}
                      >
                        30 Ngày
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setBeltLevelStatsDays(90);
                        }}
                      >
                        90 Ngày
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : studentsByBeltLevel.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Không có dữ liệu
                </div>
              ) : (
                <div id="deals-chart"></div>
              )}
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
                      {inactiveStudentsDays === 30
                        ? "30 Ngày"
                        : inactiveStudentsDays === 180
                        ? "6 Tháng"
                        : "12 Tháng"}
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setInactiveStudentsDays(30);
                        }}
                      >
                        30 Ngày
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setInactiveStudentsDays(180);
                        }}
                      >
                        6 Tháng
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setInactiveStudentsDays(365);
                        }}
                      >
                        12 Tháng
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : inactiveStudents.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Không có dữ liệu
                </div>
              ) : (
                <div id="last-chart"></div>
              )}
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
                      {promotionsDays === 30
                        ? "30 Ngày"
                        : promotionsDays === 180
                        ? "6 Tháng"
                        : "12 Tháng"}
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setPromotionsDays(30);
                        }}
                      >
                        30 Ngày
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setPromotionsDays(180);
                        }}
                      >
                        6 Tháng
                      </a>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault();
                          setPromotionsDays(365);
                        }}
                      >
                        12 Tháng
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : beltPromotions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Không có dữ liệu
                </div>
              ) : (
                <div className="table-responsive p-3">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Võ Sinh</th>
                        <th>Từ</th>
                        <th>Đến</th>
                        <th>Ngày Thăng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beltPromotions.map((promotion) => (
                        <tr key={promotion.id}>
                          <td>{promotion.user_name}</td>
                          <td>
                            <span
                              style={getBeltTextStyle(
                                promotion.from_belt_color
                              )}
                            >
                              {promotion.from_belt_name}
                            </span>
                          </td>
                          <td>
                            <span
                              style={getBeltTextStyle(promotion.to_belt_color)}
                            >
                              {promotion.to_belt_name}
                            </span>
                          </td>
                          <td>{formatDate(promotion.promotion_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <div className="dropdown">
                  <a
                    className="dropdown-toggle btn btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    href="javascript:void(0);"
                  >
                    Năm {selectedYear}
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <a
                          key={year}
                          href="javascript:void(0);"
                          className="dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedYear(year);
                          }}
                        >
                          Năm {year}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body py-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : !yearlyStats ? (
                <div className="text-center text-muted py-4">
                  Không có dữ liệu
                </div>
              ) : (
                <div id="deals-year"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Import Excel Section */}
      <div className="row mt-4">
        <div className="col-md-12 d-flex">
          <div className="card w-100">
            <div className="card-header">
              <h6 className="mb-0">Import Kết Quả Thi Từ Excel</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="excelFile" className="form-label">
                  Chọn file Excel (.xlsx, .xls)
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="excelFile"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImportFile(file);
                      setImportResult(null);
                    }
                  }}
                />
                <small className="form-text text-muted">
                  File Excel cần có các cột: Mã hội viên (hoặc Họ tên), Cấp đai
                  hiện tại, Cấp đai mục tiêu, Điểm, Kết quả, Ghi chú
                </small>
              </div>

              {importFile && (
                <div className="mb-3">
                  <p className="mb-1">
                    <strong>File đã chọn:</strong> {importFile.name}
                  </p>
                  <p className="text-muted mb-0">
                    Kích thước: {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportExcel}
                disabled={!importFile || importing}
              >
                {importing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang import...
                  </>
                ) : (
                  "Import Dữ Liệu"
                )}
              </button>

              {importResult && (
                <div
                  className={`mt-3 alert ${
                    importResult.failed > 0 ? "alert-warning" : "alert-success"
                  }`}
                >
                  <h6 className="alert-heading">Kết quả import:</h6>
                  <p className="mb-1">
                    <strong>Thành công:</strong> {importResult.imported} bản ghi
                  </p>
                  <p className="mb-1">
                    <strong>Thất bại:</strong> {importResult.failed} bản ghi
                  </p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Lỗi chi tiết:</strong>
                      <ul className="mb-0 mt-2">
                        {importResult.errors
                          .slice(0, 10)
                          .map((error, index) => (
                            <li key={index} className="small">
                              {error}
                            </li>
                          ))}
                        {importResult.errors.length > 10 && (
                          <li className="small text-muted">
                            ... và {importResult.errors.length - 10} lỗi khác
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
