"use client";

import React from "react";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
}

/**
 * Component header chung cho các trang
 * @param label - Label nhỏ phía trên (optional)
 * @param title - Tiêu đề chính
 * @param description - Mô tả (optional)
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  label,
  title,
  description,
}) => {
  return (
    <section className="page-header">
      <div className="container">
        {label && <div className="header-label">{label}</div>}
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
    </section>
  );
};

export default PageHeader;

