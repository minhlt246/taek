"use client";

import { useState, useEffect } from "react";
import { supportApi, CreateTicketDto, Ticket } from "@/services/api/support";
import { useToast } from "@/utils/toast";
import "@/styles/scss/ticket-improve.scss";
import { useAccountStore } from "@/stores/account";
interface SupportCategory {
  value: string;
  label: string;
}

interface GetMyTicketsResponse {
  docs: Ticket[];
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
}

export default function TicketPage() {
  const { loginSuccess } = useAccountStore();
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [tickets, setTickets] = useState<GetMyTicketsResponse>({
    docs: [],
    limit: 10,
    page: 1,
    totalDocs: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    text: "",
    attachment: null as File | null,
  });

  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });

  useEffect(() => {
    if (loginSuccess) {
      loadCategories();
      loadMyTickets();
    }
  }, [loginSuccess]);

  const loadCategories = async () => {
    try {
      const response = await supportApi.getSupportCategories();
      const typedResponse = response as {
        success: boolean;
        data: SupportCategory[];
      };
      if (typedResponse.success) {
        setCategories(typedResponse.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadMyTickets = async (page = 1) => {
    try {
      setLoading(true);
      const query: any = {};
      if (filters.status) query.status = filters.status;
      if (filters.date) {
        query.date = filters.date;
      }

      const response: any = await supportApi.getMyTickets({
        page: page,
        limit: tickets.limit,
        query,
      });

      setTickets(response);
    } catch (error: any) {
      setTickets({
        docs: [],
        limit: 10,
        page: 1,
        totalDocs: 0,
        totalPages: 0,
      });
      useToast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        useToast.error("File cannot exceed 2MB");
        return;
      }
      setForm((prev) => ({ ...prev, attachment: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.category || !form.text.trim()) {
      useToast.error("Please fill in all information");
      return;
    }

    setSubmitting(true);
    try {
      let image1 = "";
      if (form.attachment) {
        try {
          const uploadResponse = form.attachment.type.startsWith("image/")
            ? await supportApi.uploadImage(form.attachment)
            : await supportApi.uploadFile(form.attachment);

          if (uploadResponse && uploadResponse.length > 0) {
            const relativePath =
              uploadResponse[0].url ||
              uploadResponse[0].fullUrl ||
              uploadResponse[0].path;
            image1 = relativePath;
            useToast.success("File uploaded successfully!");
          } else {
            throw new Error("No files uploaded or invalid response");
          }
        } catch (uploadError: any) {
          useToast.error(`Upload failed: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }
      }
      const ticketData: CreateTicketDto = {
        title: form.title,
        category: form.category,
        text: form.text,
        ...(image1 && { image1: image1 }),
      };
      const response = (await supportApi.createTicket(ticketData)) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        useToast.success("Ticket has been created successfully!");
        setForm({
          title: "",
          category: "",
          text: "",
          attachment: null,
        });
        const fileInput = document.getElementById(
          "attachment"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        loadMyTickets();
      } else {
        throw new Error(response.message || "Failed to create ticket");
      }
    } catch (error: any) {
      useToast.error(
        error?.message || "An error occurred while creating the ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadMyTickets(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "status-pending";
      case "in_progress":
        return "status-replied";
      case "closed":
        return "status-closed";
      default:
        return "status-pending";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  if (!loginSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="mb-3">
            <i className="fas fa-lock fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted mb-3">Authentication Required</h4>
          <p className="text-muted mb-4">
            Please login to access the support system
          </p>
          <a href="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt me-2"></i>
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 ticket-page">
      <div className="ticket-card card mb-5">
        <div className="card-body">
          <div className="row">
            <div className="col-lg-8 col-md-10 mx-auto">
              <div className="step-header">1. Create Support Ticket</div>

              <form className="ticket-form" onSubmit={handleSubmit}>
                <div className="ticket-form-card">
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="title">
                      Subject *
                      <small className="text-muted ms-2">
                        ({form.title.length}/200 characters)
                      </small>
                    </label>
                    <input
                      id="title"
                      className="form-control"
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Unable to withdraw funds, Trading issue, Account verification"
                      maxLength={200}
                      required
                    />
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      Please provide a clear and descriptive subject
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="category">
                      Issue Category *
                    </label>
                    <select
                      id="category"
                      className="form-select"
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select issue category --</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      Choose the category that best describes your issue
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="text">
                      Description *
                      <small className="text-muted ms-2">
                        ({form.text.length}/2000 characters)
                      </small>
                    </label>
                    <textarea
                      id="text"
                      className="form-control description-textarea"
                      name="text"
                      value={form.text}
                      onChange={handleInputChange}
                      placeholder="Please describe your issue in detail. Include:&#10;- What you were trying to do&#10;- What happened instead&#10;- Any error messages you received&#10;- Steps to reproduce the issue"
                      rows={8}
                      maxLength={2000}
                      required
                    />
                    {form.text.length > 1800 && (
                      <div className="form-text text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Approaching character limit
                      </div>
                    )}
                  </div>

                  <div className="step-header">
                    2. Attach Supporting Files (Optional)
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="attachment">
                      Upload File
                    </label>
                    <div className="upload-section">
                      <input
                        id="attachment"
                        className="form-control"
                        type="file"
                        name="attachment"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      {form.attachment && (
                        <div className="file-preview mt-2">
                          <div className="file-info">
                            <i className="fas fa-file me-2 text-primary"></i>
                            <span className="file-name">
                              {form.attachment.name}
                            </span>
                            <span className="file-size text-muted">
                              ({(form.attachment.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  attachment: null,
                                }));
                                const fileInput = document.getElementById(
                                  "attachment"
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      Supported formats: Images, PDF, DOC, DOCX, TXT. Max size:
                      5MB
                    </div>
                  </div>
                </div>

                <div className="step-header">3. Review & Submit</div>

                <div className="ticket-summary-card">
                  <div className="summary-title">Ticket Summary</div>
                  <div className="summary-row">
                    <span className="label">Subject</span>
                    <span className="value">
                      {form.title || "No subject entered"}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Category</span>
                    <span className="value">
                      {form.category
                        ? categories.find((cat) => cat.value === form.category)
                            ?.label || form.category
                        : "No category selected"}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Description Length</span>
                    <span className="value">{form.text.length} characters</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Attachment</span>
                    <span className="value">
                      {form.attachment
                        ? form.attachment.name
                        : "No file attached"}
                    </span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <button
                    className="btn btn-primary submit-btn"
                    type="submit"
                    disabled={
                      submitting ||
                      !form.title.trim() ||
                      !form.category ||
                      !form.text.trim()
                    }
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    {submitting
                      ? "Submitting Ticket..."
                      : "Submit Support Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="tickets-history-section">
        <div className="tickets-card card">
          <div className="card-body">
            <div className="tickets-filter-section mb-4">
              <div className="step-header">Filter Tickets</div>
              <form className="filter-form" onSubmit={handleFilter}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="status-filter">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      className="form-select"
                      name="status"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="open">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="date-filter">
                      Date
                    </label>
                    <input
                      id="date-filter"
                      className="form-control"
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button
                      className="btn btn-outline-primary w-100"
                      type="submit"
                    >
                      <i className="fas fa-filter me-2"></i>
                      Apply Filters
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="text-muted">Loading tickets...</div>
                </div>
              ) : (
                <table className="table table-hover tickets-table text-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <i className="fas fa-hashtag me-1"></i>
                        Ticket ID
                      </th>
                      <th>
                        <i className="fas fa-envelope me-1"></i>
                        Subject
                      </th>
                      <th>
                        <i className="fas fa-flag me-1"></i>
                        Status
                      </th>
                      <th>
                        <i className="fas fa-calendar me-1"></i>
                        Created At
                      </th>
                      <th>
                        <i className="fas fa-cog me-1"></i>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.docs.length > 0 ? (
                      tickets.docs.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <code className="ticket-id">
                              #
                              {ticket.id.length > 16
                                ? `${ticket.id.slice(
                                    0,
                                    10
                                  )}...${ticket.id.slice(-4)}`
                                : ticket.id}
                            </code>
                          </td>
                          <td>
                            <div className="ticket-subject">{ticket.title}</div>
                          </td>
                          <td>
                            <span
                              className={`badge status-badge ${getStatusBadgeClass(
                                ticket.status
                              )}`}
                            >
                              {getStatusLabel(ticket.status)}
                            </span>
                          </td>
                          <td>
                            <div className="ticket-date">
                              {new Date(ticket.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  timeZone: "UTC",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}
                            </div>
                          </td>
                          <td>
                            <a
                              className="btn btn-sm btn-outline-primary"
                              href={`/ticket-detail?id=${ticket.id}`}
                            >
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <div className="empty-state">
                            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No Tickets Found</h5>
                            <p className="text-muted">
                              You haven't created any support tickets yet.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {tickets.totalDocs > tickets.limit && (
              <div className="pagination-section">
                <nav aria-label="Tickets pagination">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="pagination-info">
                      Showing {(tickets.page - 1) * tickets.limit + 1} to{" "}
                      {Math.min(
                        tickets.page * tickets.limit,
                        tickets.totalDocs
                      )}{" "}
                      of {tickets.totalDocs} tickets
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => loadMyTickets(tickets.page - 1)}
                        disabled={tickets.page <= 1}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>
                      <span className="pagination-current">
                        Page {tickets.page} of{" "}
                        {tickets.totalPages}
                      </span>
                      <button
                        onClick={() => loadMyTickets(tickets.page + 1)}
                        disabled={
                          tickets.page >= tickets.totalPages
                        }
                        className="btn btn-sm btn-outline-primary ms-2"
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
