"use client";

import { useState, useEffect } from "react";
import { schedulesApi, ScheduleResponse } from "@/services/api/schedules";
import { clubsApi, Club } from "@/services/api/clubs";
import { branchesApi, Branch } from "@/services/api/branches";
import http from "@/services/http";

interface Schedule {
  id: number;
  club_id: number;
  branch_id: number;
  day_of_week: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  club?: {
    id: number;
    name: string;
    club_code?: string;
  };
  branch?: {
    id: number;
    name: string;
    branch_code?: string;
  };
}

const DAYS_OF_WEEK = [
  { value: "Monday", label: "Thứ 2" },
  { value: "Tuesday", label: "Thứ 3" },
  { value: "Wednesday", label: "Thứ 4" },
  { value: "Thursday", label: "Thứ 5" },
  { value: "Friday", label: "Thứ 6" },
  { value: "Saturday", label: "Thứ 7" },
  { value: "Sunday", label: "Chủ nhật" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [filterDay, setFilterDay] = useState<string>("");
  const [filterClub, setFilterClub] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [formData, setFormData] = useState({
    club_id: "" as number | string,
    branch_id: "" as number | string,
    day_of_week: "",
    start_time: "",
    end_time: "",
    location: "",
  });

  /**
   * Fetch schedules from API
   */
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await http.get<ScheduleResponse[]>("/schedules");
      const data = Array.isArray(response.data) ? response.data : [];
      console.log("[SchedulesPage] Raw fetched data:", data);
      setSchedules(data as Schedule[]);
    } catch (error: any) {
      // Only log if error is not suppressed (connection errors are handled by interceptor)
      if (!error.suppressLog) {
        console.error("Failed to fetch schedules:", error);
      }
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch clubs from API
   */
  const fetchClubs = async () => {
    try {
      const clubsData = await clubsApi.getAll();
      setClubs(clubsData);
    } catch (error: any) {
      // Only log if error is not suppressed (connection errors are handled by interceptor)
      if (!error.suppressLog) {
        console.error("Lỗi khi tải danh sách CLB:", error);
      }
    }
  };

  /**
   * Fetch branches by club
   */
  const fetchBranchesByClub = async (clubId: number) => {
    if (!clubId) {
      setBranches([]);
      return;
    }

    setLoadingBranches(true);
    try {
      const overview = await clubsApi.getOverview(clubId);
      if (overview && overview.branches) {
        setBranches(overview.branches);
      } else {
        setBranches([]);
      }
    } catch (error: any) {
      // Only log if error is not suppressed (connection errors are handled by interceptor)
      if (!error.suppressLog) {
        console.error("Lỗi khi tải danh sách chi nhánh:", error);
      }
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchClubs();
  }, []);

  /**
   * Format time from "HH:mm:ss" to "HH:mm"
   */
  const formatTime = (time?: string): string => {
    if (!time) return "";
    return time.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
  };

  /**
   * Get Vietnamese day name
   */
  const getDayLabel = (day: string): string => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.value === day);
    return dayObj ? dayObj.label : day;
  };

  /**
   * Get club name
   */
  const getClubName = (schedule: Schedule): string => {
    return schedule.club?.name || `CLB #${schedule.club_id}`;
  };

  /**
   * Get branch name
   */
  const getBranchName = (schedule: Schedule): string => {
    return (
      schedule.branch?.name ||
      schedule.branch?.branch_code ||
      `Chi nhánh #${schedule.branch_id}`
    );
  };

  /**
   * Filter schedules
   */
  const filteredSchedules = schedules.filter((schedule) => {
    if (filterDay && schedule.day_of_week !== filterDay) return false;
    if (filterClub && schedule.club_id !== Number(filterClub)) return false;
    if (filterBranch && schedule.branch_id !== Number(filterBranch))
      return false;
    return true;
  });

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduleData: any = {
        club_id: Number(formData.club_id),
        branch_id: Number(formData.branch_id),
        day_of_week: formData.day_of_week,
      };

      if (formData.start_time && formData.start_time.trim()) {
        scheduleData.start_time = formData.start_time.trim();
      }

      if (formData.end_time && formData.end_time.trim()) {
        scheduleData.end_time = formData.end_time.trim();
      }

      if (formData.location && formData.location.trim()) {
        scheduleData.location = formData.location.trim();
      }

      if (editingSchedule) {
        // Update
        await schedulesApi.update(editingSchedule.id, scheduleData);
        alert("Cập nhật lịch tập thành công!");
      } else {
        // Create
        await schedulesApi.create(scheduleData);
        alert("Thêm lịch tập thành công!");
      }

      setShowModal(false);
      resetForm();
      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to save schedule:", error);
      let errorMessage = "Lỗi khi lưu lịch tập. Vui lòng thử lại.";

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  /**
   * Handle edit
   */
  const handleEdit = async (schedule: Schedule) => {
    setEditingSchedule(schedule);

    const clubId = schedule.club_id || "";
    const branchId = schedule.branch_id || "";

    setFormData({
      club_id: clubId,
      branch_id: branchId,
      day_of_week: schedule.day_of_week,
      start_time: formatTime(schedule.start_time),
      end_time: formatTime(schedule.end_time),
      location: schedule.location || "",
    });

    // Load branches nếu có club_id
    if (clubId) {
      await fetchBranchesByClub(Number(clubId));
    } else {
      setBranches([]);
    }

    setShowModal(true);
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch tập này?")) {
      return;
    }

    try {
      await schedulesApi.delete(id);
      alert("Xóa lịch tập thành công!");
      await fetchSchedules();
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Lỗi khi xóa lịch tập. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setFormData({
      club_id: "",
      branch_id: "",
      day_of_week: "" as any,
      start_time: "",
      end_time: "",
      location: "",
    });
    setEditingSchedule(null);
    setBranches([]);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý lịch tập</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm lịch tập mới
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Lọc theo ngày</label>
                <select
                  className="form-select"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                >
                  <option value="">Tất cả các ngày</option>
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Lọc theo CLB</label>
                <select
                  className="form-select"
                  value={filterClub}
                  onChange={async (e) => {
                    const clubId = e.target.value;
                    setFilterClub(clubId);
                    setFilterBranch(""); // Reset branch filter when club changes
                    // Load branches của club được chọn để hiển thị trong filter
                    if (clubId) {
                      await fetchBranchesByClub(Number(clubId));
                    } else {
                      setBranches([]);
                    }
                  }}
                >
                  <option value="">Tất cả CLB</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Lọc theo chi nhánh</label>
                <select
                  className="form-select"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  disabled={!filterClub || loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? "Đang tải..."
                      : !filterClub
                      ? "Chọn CLB trước"
                      : "Tất cả chi nhánh"}
                  </option>
                  {branches
                    .filter(
                      (branch) =>
                        !filterClub || branch.club_id === Number(filterClub)
                    )
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => {
                  setFilterDay("");
                  setFilterClub("");
                  setFilterBranch("");
                  setBranches([]);
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CLB</th>
                  <th>Chi nhánh</th>
                  <th>Ngày trong tuần</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Địa điểm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <p className="text-muted mb-0">
                        {schedules.length === 0
                          ? "Chưa có lịch tập nào."
                          : "Không tìm thấy lịch tập phù hợp với bộ lọc."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>{schedule.id}</td>
                      <td>
                        <span className="badge bg-info">
                          {getClubName(schedule)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning">
                          {getBranchName(schedule)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {getDayLabel(schedule.day_of_week)}
                        </span>
                      </td>
                      <td>
                        {schedule.start_time
                          ? formatTime(schedule.start_time)
                          : "Chưa có"}
                      </td>
                      <td>
                        {schedule.end_time
                          ? formatTime(schedule.end_time)
                          : "Chưa có"}
                      </td>
                      <td>
                        {schedule.location ? (
                          <span>{schedule.location}</span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(schedule)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Schedule */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSchedule ? "Chỉnh sửa lịch tập" : "Thêm lịch tập mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Câu lạc bộ <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.club_id}
                          onChange={async (e) => {
                            const clubId = e.target.value;
                            setFormData({
                              ...formData,
                              club_id: clubId,
                              branch_id: "", // Reset branch when club changes
                            });
                            // Load branches của club được chọn
                            if (clubId) {
                              await fetchBranchesByClub(Number(clubId));
                            } else {
                              setBranches([]);
                            }
                          }}
                          required
                        >
                          <option value="">Chọn CLB</option>
                          {clubs.map((club) => (
                            <option key={club.id} value={club.id}>
                              {club.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Chi nhánh <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.branch_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              branch_id: e.target.value,
                            })
                          }
                          disabled={!formData.club_id || loadingBranches}
                          required
                        >
                          <option value="">
                            {loadingBranches
                              ? "Đang tải..."
                              : !formData.club_id
                              ? "Chọn CLB trước"
                              : "Chọn chi nhánh"}
                          </option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Ngày trong tuần <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.day_of_week}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          day_of_week: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: các Thứ 2,4,6 hằng tuần"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giờ bắt đầu</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.start_time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              start_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giờ kết thúc</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.end_time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Địa điểm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: Phòng tập A, Sân tập chính"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingSchedule ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
