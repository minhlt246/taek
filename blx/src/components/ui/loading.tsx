"use client";

import React from "react";
import styles from "@/styles/scss/loading.module.scss";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

/**
 * Component hiển thị animation loading spinner
 * @param size - Kích thước loading: "sm" | "md" | "lg"
 * @param text - Text hiển thị (hiện tại chưa sử dụng)
 */
const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
}) => {
  return (
    <div className={styles["loading-container"]}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loading;
