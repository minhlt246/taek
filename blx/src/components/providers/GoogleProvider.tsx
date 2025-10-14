"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleProviderProps {
  children: React.ReactNode;
}

export const GoogleProvider: React.FC<GoogleProviderProps> = ({ children }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!clientId) {
    console.warn("Google Client ID not found. Google login will be disabled.");
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
};
