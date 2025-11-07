"use client";

import { useState, useEffect } from "react";
import { coursesApi } from "@/services/api/courses";
import { clubsApi, Club } from "@/services/api/clubs";
import { branchesApi, Branch } from "@/services/api/branches";

interface Course {
  id: number;
  name: string;
  description: string;
  level: string;
  duration: number; // in weeks
  price: number;
  maxStudents: number;
  currentStudents: number;
  instructor: string;
  trainingTime?: string; // Giờ tập
  trainingDays?: string; // Buổi tập
  status: "active" | "inactive" | "completed";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: "" as number | string,
    price: "" as number | string,
    maxStudents: "" as number | string,
    instructor: "",
    trainingTime: "",
    trainingDays: "",
    status: "active" as "active" | "inactive" | "completed",
    startDate: "",
    endDate: "",
    club_id: "" as number | string,
    branch_id: "" as number | string,
  });

  /**
   * Map API course data to frontend format
   */
  const mapCourseData = (course: any): Course => {
    // Calculate duration in weeks from start_date and end_date
    let duration = 12;
    if (course.start_date && course.end_date) {
      const start = new Date(course.start_date);
      const end = new Date(course.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = Math.ceil(diffDays / 7);
    }

    // Lấy tên giảng viên - ưu tiên instructor_name (text tự do), sau đó mới lấy từ relation coach
    const instructorName =
      course.instructor_name ||
      course.instructor ||
      course.coach?.name ||
      course.coach?.ho_va_ten ||
      "";

    // Lấy giá từ entity
    const price =
      course.price !== undefined && course.price !== null ? course.price : 0;

    // Lấy số học viên tối đa từ entity
    const maxStudents =
      course.max_students !== undefined && course.max_students !== null
        ? course.max_students
        : 20;

    // Lấy số học viên hiện tại
    const currentStudents =
      course.current_students !== undefined && course.current_students !== null
        ? course.current_students
        : 0;

    return {
      id: course.id,
      name: course.title || course.name || "",
      description: course.description || "",
      level: course.level || "beginner",
      duration: duration,
      price: price,
      maxStudents: maxStudents,
      currentStudents: currentStudents,
      instructor: instructorName,
      trainingTime: course.training_time || "",
      trainingDays: course.training_days || "",
      status: course.is_active === false ? "inactive" : "active",
      startDate: course.start_date || course.startDate || "",
      endDate: course.end_date || course.endDate || "",
      createdAt: course.created_at || course.createdAt || "",
      updatedAt: course.updated_at || course.updatedAt || "",
      club: course.club,
      branch: course.branch,
    };
  };

  /**
   * Fetch courses data from API
   */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch all courses including inactive ones for admin
      const data = await coursesApi.getAll(true);
      console.log("[CoursesPage] Raw fetched data:", data);

      // Debug: Log first course to check structure
      if (data.length > 0) {
        console.log("[CoursesPage] First course sample:", {
          ...data[0],
          coach: data[0].coach,
          current_students: data[0].current_students,
          price: (data[0] as any).price,
          max_students: (data[0] as any).max_students,
          allKeys: Object.keys(data[0]),
        });
      }

      // Map API response to frontend format
      const mappedCourses = (Array.isArray(data) ? data : []).map(
        mapCourseData
      );
      console.log("[CoursesPage] Mapped courses:", mappedCourses);
      setCourses(mappedCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load danh sách CLB
   */
  const fetchClubs = async () => {
    try {
      const clubsData = await clubsApi.getAll();
      setClubs(clubsData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách CLB:", error);
    }
  };

  /**
   * Load danh sách chi nhánh theo CLB
   */
  const fetchBranchesByClub = async (clubId: number) => {
    if (!clubId) {
      setBranches([]);
      return;
    }

    setLoadingBranches(true);
    try {
      // Lấy overview của club để có danh sách branches
      const overview = await clubsApi.getOverview(clubId);
      if (overview && overview.branches) {
        setBranches(overview.branches);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách chi nhánh:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchClubs();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map frontend form data to backend DTO format
      const courseData: any = {
        title: formData.name.trim(),
        description: formData.description.trim() || undefined,
        level: formData.level.toLowerCase() as
          | "beginner"
          | "intermediate"
          | "advanced",
        start_date: formData.startDate || undefined,
        end_date: formData.endDate || undefined,
        is_active: formData.status === "active",
      };

      // Xử lý các field số - chỉ thêm nếu có giá trị hợp lệ
      if (formData.duration && formData.duration !== "") {
        const duration =
          typeof formData.duration === "number"
            ? formData.duration
            : parseInt(String(formData.duration));
        if (!isNaN(duration) && duration > 0) {
          // Tính toán end_date từ start_date và duration nếu cần
        }
      }

      if (formData.price && formData.price !== "") {
        const price =
          typeof formData.price === "number"
            ? formData.price
            : parseInt(String(formData.price));
        if (!isNaN(price) && price >= 0) {
          courseData.price = price;
        }
      }

      if (formData.maxStudents && formData.maxStudents !== "") {
        const maxStudents =
          typeof formData.maxStudents === "number"
            ? formData.maxStudents
            : parseInt(String(formData.maxStudents));
        if (!isNaN(maxStudents) && maxStudents > 0) {
          courseData.max_students = maxStudents;
        }
      }

      // Thêm instructor_name nếu có
      if (formData.instructor && formData.instructor.trim()) {
        courseData.instructor_name = formData.instructor.trim();
      }

      // Thêm training_time và training_days nếu có
      if (formData.trainingTime && formData.trainingTime.trim()) {
        courseData.training_time = formData.trainingTime.trim();
      }

      if (formData.trainingDays && formData.trainingDays.trim()) {
        courseData.training_days = formData.trainingDays.trim();
      }

      // Thêm club_id và branch_id nếu có
      if (formData.club_id && formData.club_id !== "") {
        const clubId =
          typeof formData.club_id === "number"
            ? formData.club_id
            : parseInt(String(formData.club_id));
        if (!isNaN(clubId) && clubId > 0) {
          courseData.club_id = clubId;
        }
      }

      if (formData.branch_id && formData.branch_id !== "") {
        const branchId =
          typeof formData.branch_id === "number"
            ? formData.branch_id
            : parseInt(String(formData.branch_id));
        if (!isNaN(branchId) && branchId > 0) {
          courseData.branch_id = branchId;
        }
      }

      // Remove undefined, null, empty string values
      Object.keys(courseData).forEach((key) => {
        if (
          courseData[key] === undefined ||
          courseData[key] === null ||
          courseData[key] === ""
        ) {
          delete courseData[key];
        }
      });

      // Debug: Log data before sending
      console.log("[CoursesPage] Course data to send:", courseData);

      if (editingCourse) {
        // Update existing course
        const updateResponse = await coursesApi.update(
          editingCourse.id,
          courseData
        );
        console.log("[CoursesPage] Update response:", updateResponse);
      } else {
        // Create new course
        const createResponse = await coursesApi.create(courseData);
        console.log("[CoursesPage] Create response:", createResponse);
      }

      // Close modal first
      setShowModal(false);
      setEditingCourse(null);
      resetForm();

      // Refresh data immediately - fetch all courses including inactive
      await fetchCourses();

      alert(
        editingCourse
          ? "Cập nhật khóa học thành công!"
          : "Tạo khóa học mới thành công!"
      );
    } catch (error: any) {
      console.error("Lỗi khi lưu khóa học:", error);
      let errorMessage = "Lỗi khi lưu khóa học. Vui lòng thử lại.";

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

  const handleEdit = async (course: Course) => {
    setEditingCourse(course);

    // Lấy club_id và branch_id từ course
    const clubId = (course as any).club_id || course.club?.id || "";
    const branchId = (course as any).branch_id || course.branch?.id || "";

    setFormData({
      name: course.name || "",
      description: course.description || "",
      level: course.level as "beginner" | "intermediate" | "advanced",
      duration:
        course.duration !== undefined && course.duration !== null
          ? course.duration
          : "",
      price:
        course.price !== undefined && course.price !== null ? course.price : "",
      maxStudents:
        course.maxStudents !== undefined && course.maxStudents !== null
          ? course.maxStudents
          : "",
      instructor: course.instructor || "",
      trainingTime: course.trainingTime || "",
      trainingDays: course.trainingDays || "",
      status: course.status,
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      club_id: clubId,
      branch_id: branchId,
    });

    // Load branches nếu có club_id
    if (clubId) {
      await fetchBranchesByClub(Number(clubId));
    } else {
      setBranches([]);
    }

    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      return;
    }

    try {
      await coursesApi.delete(id);
      alert("Xóa khóa học thành công!");

      // Refresh data - fetch all courses including inactive
      await fetchCourses();
    } catch (error: any) {
      console.error("Failed to delete course:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi xóa khóa học. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      level: "beginner",
      duration: "",
      price: "",
      maxStudents: "",
      instructor: "",
      trainingTime: "",
      trainingDays: "",
      status: "active",
      startDate: "",
      endDate: "",
      club_id: "",
      branch_id: "",
    });
    setEditingCourse(null);
    setBranches([]);
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
    <div className="courses-page">
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm khóa học mới
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Cấp độ</th>
                  <th>Thời gian</th>
                  <th>Giá</th>
                  <th>Học viên</th>
                  <th>CLB</th>
                  <th>Chi nhánh</th>
                  <th>Giảng viên</th>
                  <th>Giờ tập</th>
                  <th>Buổi tập</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-4">
                      <p className="text-muted mb-0">Chưa có khóa học nào.</p>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>
                        <div>
                          <strong>{course.name}</strong>
                          {course.description && (
                            <>
                              <br />
                              <small className="text-muted">
                                {course.description}
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {course.level === "beginner"
                            ? "Cơ bản"
                            : course.level === "intermediate"
                            ? "Trung cấp"
                            : course.level === "advanced"
                            ? "Nâng cao"
                            : course.level}
                        </span>
                      </td>
                      <td>{course.duration} tuần</td>
                      <td>
                        {course.price !== undefined && course.price !== null
                          ? formatCurrency(course.price)
                          : "0 đ"}
                      </td>
                      <td>
                        {course.currentStudents !== undefined &&
                        course.maxStudents !== undefined
                          ? `${course.currentStudents}/${course.maxStudents}`
                          : "0/20"}
                        {course.maxStudents > 0 && (
                          <div
                            className="progress mt-1"
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${Math.min(
                                  ((course.currentStudents || 0) /
                                    course.maxStudents) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td>
                        {course.club?.name ? (
                          <span className="badge bg-info">
                            {course.club.name}
                          </span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td>
                        {course.branch?.name ? (
                          <span className="badge bg-warning">
                            {course.branch.name}
                          </span>
                        ) : course.branch?.branch_code ? (
                          <span className="badge bg-warning">
                            {course.branch.branch_code}
                          </span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td>
                        {course.instructor && course.instructor.trim() ? (
                          <span className="badge bg-primary">
                            {course.instructor}
                          </span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td>
                        {course.trainingTime && course.trainingTime.trim()
                          ? course.trainingTime
                          : "Chưa có"}
                      </td>
                      <td>
                        {course.trainingDays && course.trainingDays.trim()
                          ? course.trainingDays
                          : "Chưa có"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            course.status === "active"
                              ? "bg-success"
                              : course.status === "completed"
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}
                        >
                          {course.status === "active"
                            ? "Hoạt động"
                            : course.status === "completed"
                            ? "Hoàn thành"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(course)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(course.id)}
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

      {/* Modal for Add/Edit Course */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
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
                        <label className="form-label">Tên khóa học</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cấp độ</label>
                        <select
                          className="form-select"
                          value={formData.level}
                          onChange={(e) =>
                            setFormData({ ...formData, level: e.target.value })
                          }
                          required
                        >
                          <option value="">Chọn cấp độ</option>
                          <option value="beginner">Cơ bản</option>
                          <option value="intermediate">Trung cấp</option>
                          <option value="advanced">Nâng cao</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Thời gian (tuần)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration:
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value) || "",
                            })
                          }
                          min="1"
                          placeholder="Nhập số tuần"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Giá (VND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price:
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value) || "",
                            })
                          }
                          min="0"
                          placeholder="Nhập giá"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Số học viên tối đa</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxStudents}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxStudents:
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value) || "",
                            })
                          }
                          min="1"
                          placeholder="Nhập số học viên"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Câu lạc bộ</label>
                        <select
                          className="form-select"
                          value={formData.club_id}
                          onChange={async (e) => {
                            const clubId = e.target.value;
                            setFormData({
                              ...formData,
                              club_id: clubId,
                              branch_id: "", // Reset branch khi đổi club
                            });
                            // Load branches của club được chọn
                            if (clubId) {
                              await fetchBranchesByClub(Number(clubId));
                            } else {
                              setBranches([]);
                            }
                          }}
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
                        <label className="form-label">Chi nhánh</label>
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
                    <label className="form-label">Giảng viên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      placeholder="Nhập tên giảng viên (có thể là HLV chưa có trong hệ thống)"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giờ tập</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.trainingTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trainingTime: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: 18:00-19:30"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Buổi tập</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.trainingDays}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trainingDays: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Thứ 2, 4, 6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ngày bắt đầu</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ngày kết thúc</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as
                            | "active"
                            | "inactive"
                            | "completed",
                        })
                      }
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
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
                    {editingCourse ? "Cập nhật" : "Tạo mới"}
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
