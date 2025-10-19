"use client";

import { useState, useEffect } from "react";
import { coursesApi } from "@/services/adminApi";

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
  status: "active" | "inactive" | "completed";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: 12,
    price: 0,
    maxStudents: 20,
    instructor: "",
    status: "active" as "active" | "inactive" | "completed",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await coursesApi.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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
      const courseData = {
        title: formData.name,
        description: formData.description,
        level: formData.level.toLowerCase() as
          | "beginner"
          | "intermediate"
          | "advanced",
        coach_id: 1, // Default coach ID - should be selected from dropdown
        club_id: 1, // Default club ID - should be selected from dropdown
        branch_id: 1, // Default branch ID - should be selected from dropdown
        start_date: formData.startDate,
        end_date: formData.endDate,
        current_students: 0, // Will be updated when students enroll
        is_active: formData.status === "active",
      };

      if (editingCourse) {
        // Update existing course
        await coursesApi.update(editingCourse.id, courseData);
        // Update local state
        setCourses(
          courses.map((course) =>
            course.id === editingCourse.id
              ? { ...course, ...formData, updatedAt: new Date().toISOString() }
              : course
          )
        );
      } else {
        // Create new course
        const newCourse = await coursesApi.create(courseData);
        // Add to local state
        setCourses([
          ...courses,
          {
            ...newCourse,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save course:", error);
      alert("Failed to save course. Please try again.");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      instructor: course.instructor,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await coursesApi.delete(id);
        // Remove from local state
        setCourses(courses.filter((course) => course.id !== id));
        alert("Course deleted successfully!");
      } catch (error) {
        console.error("Failed to delete course:", error);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      level: "beginner",
      duration: 12,
      price: 0,
      maxStudents: 20,
      instructor: "",
      status: "active",
      startDate: "",
      endDate: "",
    });
    setEditingCourse(null);
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
    <div className="courses-page">
      <div className="page-header">
        <h2>Courses Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Course
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Students</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>
                      <div>
                        <strong>{course.name}</strong>
                        <br />
                        <small className="text-muted">
                          {course.description}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">{course.level}</span>
                    </td>
                    <td>{course.duration} weeks</td>
                    <td>{formatCurrency(course.price)}</td>
                    <td>
                      {course.currentStudents}/{course.maxStudents}
                      <div className="progress mt-1" style={{ height: "5px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (course.currentStudents / course.maxStudents) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td>{course.instructor}</td>
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
                        {course.status}
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
                ))}
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
                  {editingCourse ? "Edit Course" : "Add New Course"}
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
                        <label className="form-label">Course Name</label>
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
                        <label className="form-label">Level</label>
                        <select
                          className="form-select"
                          value={formData.level}
                          onChange={(e) =>
                            setFormData({ ...formData, level: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
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
                        <label className="form-label">Duration (weeks)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Price (VND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseInt(e.target.value),
                            })
                          }
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Max Students</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxStudents}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxStudents: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Instructor</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
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
                        <label className="form-label">End Date</label>
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
                    <label className="form-label">Status</label>
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCourse ? "Update" : "Create"}
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
