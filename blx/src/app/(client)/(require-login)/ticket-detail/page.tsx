"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supportApi } from "@/services/api/support";
import { useToast } from "@/utils/toast";
import "@/styles/scss/ticket-improve.scss";
import { useAccountStore } from "@/stores/account";

interface TicketDetail {
  id: string;
  title: string;
  userId: number;
  category: string;
  status: string;
  text: string;
  image1?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

interface Reply {
  id: string;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export default function TicketDetailPage() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const { loginSuccess } = useAccountStore();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState("");

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatTicketId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}-${id.slice(9, 10)}...${id.slice(-4)}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-warning text-dark";
      case "in_progress":
        return "bg-info text-white";
      case "closed":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
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

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      login_error: "Login Issues",
      account_security: "Account & Security",
      payment_issue: "Payment Issues",
      technical: "Technical Support",
      general: "General Inquiry",
    };
    return categoryMap[category] || category;
  };

  const loadTicketDetail = async () => {
    if (!ticketId) return;

    try {
      const response: any = await supportApi.getTicketDetail(ticketId);
      setTicket(response);
    } catch (error: any) {
      useToast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const loadTicketReplies = async () => {
    if (!ticketId) return;

    try {
      const response = await supportApi.getTicketReplies(ticketId);
      if (Array.isArray(response)) {
        setReplies(response);
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        (response as any).success
      ) {
        setReplies((response as any).data || []);
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray((response as any).data)
      ) {
        setReplies((response as any).data);
      } else {
        setReplies([]);
      }
    } catch (error: any) {
      console.error("Failed to load replies:", error);
      setReplies([]);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim()) {
      useToast.error("Please enter your reply");
      return;
    }

    if (!ticketId) return;

    try {
      setSubmitting(true);
      const response: any = await supportApi.replyToTicket(
        ticketId,
        replyText.trim()
      );

      if (response && response.success !== false) {
        useToast.success("Reply sent successfully!");
        setReplyText("");
        loadTicketReplies();
      } else {
        useToast.error("Failed to send reply");
      }
    } catch (error: any) {
      useToast.error("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId) return;

    const confirmed = window.confirm(
      "Are you sure you want to close this ticket?"
    );
    if (!confirmed) return;
    try {
      setSubmitting(true);
      const response: any = await supportApi.closeTicket(ticketId);
      if (response && response.success !== false) {
        useToast.success("Ticket closed successfully!");
        loadTicketDetail();
      } else {
        useToast.error("Failed to close ticket");
      }
    } catch (error: any) {
      useToast.error("Failed to close ticket");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (loginSuccess && ticketId) {
      setLoading(true);
      loadTicketDetail();
      loadTicketReplies();
    }
  }, [loginSuccess, ticketId]);

  if (loading) {
    return (
      <section
        key="loading"
        className="py-5 min-vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">"Loading ticket details..."</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section
        key="not-found"
        className="py-5 min-vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-exclamation-triangle fa-3x text-muted"></i>
                </div>
                <h4 className="text-muted mb-3">Ticket Not Found</h4>
                <p className="text-muted mb-4">
                  The ticket you're looking for doesn't exist or you don't have
                  permission to view it.
                </p>
                <a href="/ticket" className="btn btn-primary">
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Tickets
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="container py-4 ticket-detail-page">
      <div className="page-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a href="/ticket" className="btn btn-outline-secondary me-3">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Tickets
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Ticket Details Column */}
        <div className="col-lg-6 mb-4">
          <div className="ticket-detail-card card h-100">
            <div className="card-body">
              <div className="step-header">Ticket Information</div>

              <div className="ticket-info-card">
                <div className="ticket-header">
                  <div className="ticket-id-section">
                    <span className="ticket-id-label">Ticket ID</span>
                    <code className="ticket-id">
                      #{formatTicketId(ticket.id)}
                    </code>
                  </div>
                  <span
                    className={`badge status-badge ${getStatusBadgeClass(
                      ticket.status
                    )}`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div className="ticket-meta">
                  <div className="meta-row">
                    <div className="meta-item">
                      <i className="fas fa-envelope text-primary me-2"></i>
                      <span className="meta-label">Subject:</span>
                      <span className="meta-value">{ticket.title}</span>
                    </div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-item">
                      <i className="fas fa-folder text-primary me-2"></i>
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-item">
                      <i className="fas fa-calendar text-primary me-2"></i>
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">
                        {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-item">
                      <i className="fas fa-clock text-primary me-2"></i>
                      <span className="meta-label">Last Updated:</span>
                      <span className="meta-value">
                        {formatDateTime(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Original Message Content */}
                <div className="original-message-section mt-4">
                  <h6 className="message-section-title">
                    <i className="fas fa-comment-dots text-primary me-2"></i>
                    Original Message
                  </h6>
                  <div className="original-message-content">
                    <div className="message-text">{ticket.text}</div>
                    {ticket.image1 && (
                      <div className="message-attachment mt-3">
                        <div className="attachment-preview">
                          <img
                            src={ticket.image1}
                            alt="Attachment"
                            className="attachment-image"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies Section */}
                {replies.length > 0 && (
                  <div className="replies-section mt-4">
                    <h6 className="message-section-title">
                      <i className="fas fa-comments text-primary me-2"></i>
                      Conversation ({replies.length} replies)
                    </h6>
                    <div className="replies-container">
                      {replies.map((reply, index) => (
                        <div
                          key={reply.id}
                          className={`reply-item ${
                            reply.isAdminReply ? "admin-reply" : "user-reply"
                          }`}
                        >
                          <div className="reply-header">
                            <div className="reply-author">
                              <i
                                className={
                                  reply.isAdminReply
                                    ? "fas fa-headset text-success"
                                    : "fas fa-user text-primary"
                                }
                              ></i>
                              <span className="author-name">
                                {reply.isAdminReply ? "Support Team" : "You"}
                              </span>
                            </div>
                            <span className="reply-time">
                              {formatDateTime(reply.createdAt)}
                            </span>
                          </div>
                          <div className="reply-content">{reply.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form Column */}
        {ticket.status.toLowerCase() !== "closed" ? (
          <div className="col-lg-6 mb-4">
            <div className="reply-section h-100">
              <div className="reply-card card h-100">
                <div className="card-body">
                  <div className="step-header">Send Reply</div>
                  <form onSubmit={handleSubmitReply} className="reply-form">
                    <div className="form-group mb-3">
                      <label className="form-label">Your Reply</label>
                      <textarea
                        className="form-control reply-textarea"
                        name="reply"
                        rows={12}
                        placeholder="Type your reply to the support team..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      />
                      <div className="form-text">
                        <i className="fas fa-info-circle me-1"></i>
                        Please provide as much detail as possible to help us
                        assist you better.
                      </div>
                    </div>

                    <div className="reply-actions">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={handleCloseTicket}
                          disabled={submitting}
                        >
                          <i className="fas fa-times me-2"></i>
                          {submitting ? "Closing..." : "Close Ticket"}
                        </button>

                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={submitting || !replyText.trim()}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          {submitting ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-lg-6 mb-4">
            <div className="closed-ticket-section">
              <div className="step-header">Ticket Status</div>

              <div className="closed-ticket-notice">
                <div className="alert alert-info h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-lock fa-2x text-info me-3"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Ticket Closed</h6>
                      <p className="mb-0">
                        This ticket has been closed and is no longer accepting
                        replies.
                      </p>
                    </div>
                  </div>
                  <hr />
                  <div className="text-center">
                    <p className="mb-3">
                      If you need further assistance, please create a new
                      support ticket.
                    </p>
                    <a href="/ticket" className="btn btn-outline-primary">
                      <i className="fas fa-plus me-2"></i>
                      Create New Ticket
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
