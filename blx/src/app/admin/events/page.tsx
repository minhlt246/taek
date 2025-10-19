"use client";

import { useState, useEffect } from "react";
import { eventsApi } from "@/services/adminApi";

interface Event {
  id: number;
  title: string;
  description: string;
  type: "tournament" | "seminar" | "graduation" | "social" | "other";
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationFee: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizer: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "tournament" as
      | "tournament"
      | "seminar"
      | "graduation"
      | "social"
      | "other",
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    maxParticipants: 50,
    registrationFee: 0,
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    organizer: "",
  });

  useEffect(() => {
    // Simulate API call to fetch events
    const fetchEvents = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setEvents([
          {
            id: 1,
            title: "Spring Taekwondo Tournament 2024",
            description: "Annual spring tournament for all belt levels",
            type: "tournament",
            location: "Main Branch - District 1",
            startDate: "2024-03-15",
            endDate: "2024-03-15",
            startTime: "08:00",
            endTime: "18:00",
            maxParticipants: 100,
            currentParticipants: 75,
            registrationFee: 500000,
            status: "upcoming",
            organizer: "Master Nguyen Van A",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-15",
          },
          {
            id: 2,
            title: "Belt Promotion Ceremony",
            description: "Monthly belt promotion ceremony for students",
            type: "graduation",
            location: "Branch - District 3",
            startDate: "2024-02-28",
            endDate: "2024-02-28",
            startTime: "14:00",
            endTime: "16:00",
            maxParticipants: 50,
            currentParticipants: 32,
            registrationFee: 0,
            status: "upcoming",
            organizer: "Master Tran Thi B",
            createdAt: "2024-02-01",
            updatedAt: "2024-02-01",
          },
          {
            id: 3,
            title: "Self-Defense Workshop",
            description: "Special workshop on self-defense techniques",
            type: "seminar",
            location: "Main Branch - District 1",
            startDate: "2024-02-20",
            endDate: "2024-02-20",
            startTime: "09:00",
            endTime: "12:00",
            maxParticipants: 30,
            currentParticipants: 28,
            registrationFee: 200000,
            status: "upcoming",
            organizer: "Grand Master Le Van C",
            createdAt: "2024-02-05",
            updatedAt: "2024-02-05",
          },
          {
            id: 4,
            title: "Club Anniversary Celebration",
            description: "Celebrating 10 years of our Taekwondo club",
            type: "social",
            location: "Main Branch - District 1",
            startDate: "2024-01-30",
            endDate: "2024-01-30",
            startTime: "18:00",
            endTime: "22:00",
            maxParticipants: 200,
            currentParticipants: 150,
            registrationFee: 100000,
            status: "completed",
            organizer: "Club Management",
            createdAt: "2024-01-10",
            updatedAt: "2024-01-10",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchEvents();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return eventDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tournament":
        return "bg-danger";
      case "seminar":
        return "bg-info";
      case "graduation":
        return "bg-success";
      case "social":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary";
      case "ongoing":
        return "bg-success";
      case "completed":
        return "bg-secondary";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Update existing event
        await eventsApi.update(editingEvent.id, formData);
        // Update local state
        setEvents(
          events.map((event) =>
            event.id === editingEvent.id
              ? { ...event, ...formData, updatedAt: new Date().toISOString() }
              : event
          )
        );
      } else {
        // Create new event
        const newEvent = await eventsApi.create(formData);
        // Add to local state
        setEvents([
          ...events,
          {
            ...newEvent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      maxParticipants: event.maxParticipants,
      registrationFee: event.registrationFee,
      status: event.status,
      organizer: event.organizer,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await eventsApi.delete(id);
        // Remove from local state
        setEvents(events.filter((event) => event.id !== id));
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "tournament",
      location: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      maxParticipants: 50,
      registrationFee: 0,
      status: "upcoming",
      organizer: "",
    });
    setEditingEvent(null);
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
    <div className="events-page">
      <div className="page-header">
        <h2>Events Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Event
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Date & Time</th>
                  <th>Participants</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>
                      <div>
                        <strong>{event.title}</strong>
                        <br />
                        <small className="text-muted">
                          {event.description}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td>{event.location}</td>
                    <td>
                      <div>
                        <strong>
                          {formatDateTime(event.startDate, event.startTime)}
                        </strong>
                        {event.endDate !== event.startDate && (
                          <>
                            <br />
                            <small>
                              to {formatDateTime(event.endDate, event.endTime)}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      {event.currentParticipants}/{event.maxParticipants}
                      <div className="progress mt-1" style={{ height: "5px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (event.currentParticipants /
                                event.maxParticipants) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      {event.registrationFee > 0
                        ? formatCurrency(event.registrationFee)
                        : "Free"}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(event)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(event.id)}
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

      {/* Modal for Add/Edit Event */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEvent ? "Edit Event" : "Add New Event"}
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
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Event Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Event Type</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as
                                | "tournament"
                                | "seminar"
                                | "graduation"
                                | "social"
                                | "other",
                            })
                          }
                          required
                        >
                          <option value="tournament">Tournament</option>
                          <option value="seminar">Seminar</option>
                          <option value="graduation">Graduation</option>
                          <option value="social">Social</option>
                          <option value="other">Other</option>
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
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
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
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Max Participants</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxParticipants: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Registration Fee (VND)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.registrationFee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              registrationFee: parseInt(e.target.value),
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Organizer</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.organizer}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organizer: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as
                                | "upcoming"
                                | "ongoing"
                                | "completed"
                                | "cancelled",
                            })
                          }
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
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
                    {editingEvent ? "Update" : "Create"}
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
